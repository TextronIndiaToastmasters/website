"""Converts the club's monthly Attendance/Role-Takers Excel workbooks into
data/stats.json for the website. Each month gets its own file in excel-data/,
named stats_<year>_<month>.xlsm (e.g. stats_2026_july.xlsm). Run this locally
after updating/adding a workbook, then commit the regenerated JSON and push
(Vercel redeploys automatically).

Usage:
    python scripts/generate_stats.py

Requires: pip install openpyxl
"""

import json
import re
import sys
from datetime import datetime
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "excel-data"
OUT = ROOT / "data" / "stats.json"

FILENAME_RE = re.compile(r"^stats_(\d{4})_([a-zA-Z]+)\.xlsm$")
MONTH_NUMBERS = {
    "january": 1, "february": 2, "march": 3, "april": 4, "may": 5, "june": 6,
    "july": 7, "august": 8, "september": 9, "october": 10, "november": 11, "december": 12,
}


def discover_workbooks():
    """Returns (year, month, path) tuples sorted chronologically (oldest first)."""
    found = []
    for path in DATA_DIR.glob("stats_*.xlsm"):
        match = FILENAME_RE.match(path.name)
        if not match:
            print(f"Skipping unrecognized file name: {path.name}", file=sys.stderr)
            continue
        year = int(match.group(1))
        month = MONTH_NUMBERS.get(match.group(2).lower())
        if month is None:
            print(f"Skipping unrecognized month in file name: {path.name}", file=sys.stderr)
            continue
        found.append((year, month, path))
    found.sort(key=lambda f: (f[0], f[1]))
    return found


def clean_name(value):
    return " ".join(str(value).split())


def find_col(header_row, label):
    for cell in header_row:
        if isinstance(cell.value, str) and cell.value.strip() == label:
            return cell.column
    return None


def date_columns(header_row):
    cols = []
    for cell in header_row:
        if cell.column == 1:
            continue
        if isinstance(cell.value, datetime):
            cols.append(cell.column)
        elif cols:
            break
    return cols


def build_attendance(wb):
    ws = wb["Attendence"]
    header = ws[1]
    date_cols = date_columns(header)
    points_col = find_col(header, "Points")
    dates = [ws.cell(row=1, column=c).value.strftime("%Y-%m-%d") for c in date_cols]

    entries = []
    for row in ws.iter_rows(min_row=2, max_row=ws.max_row):
        name = row[0].value
        if not name:
            continue
        attended = sum(1 for c in date_cols if row[c - 1].value)
        points = (row[points_col - 1].value if points_col else None) or attended * 2
        total = len(date_cols)
        percentage = round((attended / total) * 100, 1) if total else 0
        entries.append({
            "name": clean_name(name),
            "meetingsAttended": attended,
            "totalMeetings": total,
            "points": points,
            "percentage": percentage,
        })

    entries.sort(key=lambda e: e["points"], reverse=True)
    return dates, entries


def build_role_takers(wb):
    ws = wb["Role Takers (points)"]
    header = ws[1]
    total_rt_col = find_col(header, "Total RT")
    total_combined_col = find_col(header, "Total Attendance & RT (No Need)")

    entries = []
    for row in ws.iter_rows(min_row=2, max_row=ws.max_row):
        name = row[0].value
        if not name:
            continue
        entries.append({
            "name": clean_name(name),
            "roleTakerPoints": (row[total_rt_col - 1].value if total_rt_col else 0) or 0,
            "totalCombinedPoints": (row[total_combined_col - 1].value if total_combined_col else 0) or 0,
        })

    entries.sort(key=lambda e: e["roleTakerPoints"], reverse=True)
    return entries


def build_buddy_olympics(wb):
    ws = wb["Buddy Olympics"]
    header = ws[1]
    date_cols = set(date_columns(header))
    fixed_cols = {1}
    for label in ("Total", "Total Attendance & RT", "Total - A"):
        col = find_col(header, label)
        if col:
            fixed_cols.add(col)

    team_cols = [
        (cell.column, cell.value)
        for cell in header
        if cell.column not in date_cols and cell.column not in fixed_cols and cell.value
    ]

    totals_row = ws[2]
    entries = [
        {"team": clean_name(name), "points": totals_row[col - 1].value or 0}
        for col, name in team_cols
    ]
    entries.sort(key=lambda e: e["points"], reverse=True)
    return entries


def build_people_choice(wb):
    ws = wb["People Choice Award"]
    header = ws[1]
    dates = [
        (cell.column, cell.value.strftime("%Y-%m-%d"))
        for cell in header
        if cell.column != 1 and isinstance(cell.value, datetime)
    ]

    by_date = {d: {} for _, d in dates}
    for row in ws.iter_rows(min_row=2, max_row=ws.max_row):
        category = row[0].value
        if not category:
            continue
        for col, d in dates:
            winner = row[col - 1].value
            if winner:
                by_date[d][category] = clean_name(winner)

    meetings = [{"date": d, "awards": awards} for d, awards in by_date.items() if awards]
    meetings.sort(key=lambda m: m["date"], reverse=True)
    return meetings


def main():
    workbooks = discover_workbooks()
    if not workbooks:
        print(f"No workbooks found in {DATA_DIR} (expected stats_<year>_<month>.xlsm)", file=sys.stderr)
        sys.exit(1)

    months = []
    for year, month, path in workbooks:
        print(f"Processing {path.name}...")
        wb = openpyxl.load_workbook(path, data_only=True)
        dates, attendance = build_attendance(wb)
        months.append({
            "key": f"{year}-{month:02d}",
            "label": datetime(year, month, 1).strftime("%B %Y"),
            "meetingDates": dates,
            "attendance": attendance,
            "roleTakers": build_role_takers(wb),
            "buddyOlympics": build_buddy_olympics(wb),
            "peopleChoiceAwards": build_people_choice(wb),
        })

    stats = {
        "generatedAt": datetime.now().isoformat(timespec="seconds"),
        "months": months,
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(stats, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main()
