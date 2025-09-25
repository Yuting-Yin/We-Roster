## What
Implemented the We Roster home page backend, with all the interactive icons active.

## Why
As a user, I want to:
* See my shifts in a timetable form
* See unallocated shifts in a timetable form
* Expand the calendar to see more days
* Request for a leave/shift swap
* Submit a leave/shift swap
* Fill in an unallocated shift
* Submit the form for filling in an unallocated shift

## How
- Code arranged in layers
- Each DTO represents a set of data to be returned to frontend
- Service layer writes sql query to backend using jdbc

## Tests
- Curl tests

## API / UI
- OpenAPI

## Impact
- DB migration? Y
- Backward compatible? Y/N
- Docs updated? Y