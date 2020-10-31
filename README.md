# FS-CMS

## Local Usage

```sh
# Clone Repo
git clone git@github.com:beardedtim/fs-cms.git

# Change into Directory
cd fs-cms

# Install Deps
yarn

# Run in Dev Mode
yarn dev
```

## Usage

- You can request files directly
- You can parse files using `%%var_name%%`
- You can create templates with `%%var_name%%` and `<!--#include 'path/relative/to/FILE_ROOT_DIR' -->
  - Spacing is _vitally_ important


## Example
![](https://cdn.loom.com/sessions/thumbnails/cdd56c727a0e429889f2194521d08430-with-play.gif)

> Loom: https://www.loom.com/embed/cdd56c727a0e429889f2194521d08430

### Current State

- Start system
- Go to `localhost:5000/people/jan` or `localhost:5000/people/tim`
- See information displayed
- Change information and see it displayed on refresh
- Add new file ending with `.person` somewhere in `FILE_ROOT_DIR`
- See it is picked up at `localhost:5000/people/<file name without the .person ending>`


### Adding Custom Type

- Start system
- In `createServer` callback, add new `is_req_to_new_type` call
- Do whatever you want to do in order to handle that new type of request

You can look at how `is_req_to_a_person` is done