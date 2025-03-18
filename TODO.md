TODO:
Backend:

- endpoint data validation
- refactor for extensibility
- authentication
- check the id of elastic documents

Frontend:

- Data validation (check column contraints when editing/adding rows, check validity of JSON)
- Better UI/UX (add loading states, error states, improve visuals)
- infinite scrolling
- json editor in modal
- handle corner cases (ex: changing id for elastic doc)

schema for how to make this app extensible

TODO:

Document:

- Add filter for indices in elasticsearch - allowed*indices in config json, \_x* in elastic
- key value editor for adding documents in elastic (read template from back)
- string search

SQL:

- serach by column
- allowed tables,

---

Dropdown to select source
Column Filter Before Search

Elsastic:

- Get a snippet of the file, if the user clicks on top of it, fetch the whole object
- Add Fields filter (multiple choice)

File:

Put buttons first

- FETCH BY ID CORNER CASE: primary key column has a different name
- ELASTIC QUERY FIELDS FILTER
