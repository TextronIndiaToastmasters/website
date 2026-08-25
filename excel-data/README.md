# excel-data/stats.xlsm

Single workbook that holds **all** meetings (any month/year). It's read by
[scripts/generate_stats.py](../scripts/generate_stats.py) to produce
[data/stats.json](../data/stats.json), which the website reads. Regeneration
happens automatically via `.github/workflows/generate-stats.yml` whenever this
file changes on `main` — you don't need to run the script yourself, just edit
the workbook and push/upload it.

## Adding a new meeting

For each sheet below, insert the new meeting's date as the **next empty
column immediately to the right of the last date column** (each sheet has a
few blank spare columns reserved before the "Total"/"Points" columns — use
those first; insert a new column instead only once they run out). Leaving a
gap (skipping a blank column) will stop the script from reading anything past
the gap, so keep date columns contiguous.

## Sheets

### `Attendence`
- Column A: person's name (row 1 header cell = `Names`).
- One column per meeting date (row 1 cell = an actual Excel date, e.g. `2026-07-02`).
- Attendance for a person/date = any truthy value in that cell (a `1` is the convention; blank = absent).
- `Points` / `Percentage` columns near the end are **not read** — the script
  always recomputes points as `meetings attended × 2` and percentage as
  `attended / total meetings`, using only the date columns. You can leave
  these as a manual sanity-check, but they don't need to be kept accurate.

### `Role Takers`
- Reference-only sheet (which role each person took per meeting, e.g. Speaker/Timer). **Not read** by the script — free to maintain however is convenient.

### `Role Takers (points)`
- Column A: name. One column per meeting date holding that meeting's role-taking points for the person.
- `Total RT`: sum of role-taking points — read as each person's `roleTakerPoints`.
- `Total Attendance & RT (No Need)`: combined attendance + role points — read as `totalCombinedPoints`.
- Other columns (`Total - A`, etc.) are not read.

### `Buddy Olympics`
- Column A: name, with per-meeting points in the date columns (same shape as the other sheets).
- After the date columns and the `Total` / `Total Attendance & RT` / `Total - A` columns, there is one column per **team name** (row 1 header = the team name).
- **Row 2 doubles as the team-totals row**: whatever is in each team column on row 2 is that team's total points, regardless of whose attendance data is in row 2's other columns. Don't delete/reorder row 2, and update the team totals there when scores change.

### `People Choice Award`
- Laid out sideways compared to the other sheets: column A holds award **category** names (e.g. `Best Speaker`), and each subsequent column is one meeting date (row 1 header). Cell values are the winner's name for that category/date.

## Notes
- Sheet names and the column labels the script looks for (like `Total RT`) are matched ignoring case and extra/leading/trailing whitespace, and the `Attendence` sheet also accepts the spelling `Attendance`. Everything else must still match (e.g. `Role Takers (points)`, `Buddy Olympics`, `People Choice Award`).
- `requirements.txt` / the local `.venv` have everything needed to run `python scripts/generate_stats.py` manually if you want to preview `data/stats.json` before pushing.
