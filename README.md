# Uptobox CLI

## Requirement

- Retrieve your API token from your Uptobox account : [How to find my API token ?](https://docs.uptobox.com/#how-to-find-my-api-token)

- Install dependencies : `npm i`

## Usage

#### Commands : 

- `listFiles`\
  **Options:**
  - `--path <path>`\
    Needs to be prefixed by a double slash, e.g., `'//Movies'`.\
    **Default:** `'//'` (root path).
  - `--limit <limit>`\
    Number of files to retrieve, from `1` to `100`.\
    **Default:** `100`.
  - `--offset <offset>`\
    Retrieve from the specified offset.\
    **Default:** `0`.
  - `--order <column_name>`\
    Sort the result by one of these column names :\
    `file_name`, `file_size`, `file_created`, `file_downloads` or `transcoded`.\
    **Default:** `file_name`.
  - `--dir 'asc'|'desc'`\
    Sort direction.\
    **Default:** `'asc'`.
  - `--search <search_value>`\
    Case insensitive and works with partial filenames.
  - `--search-field <column_name>`\
    See `--order` for `<column_name>` value.
    
- `getDownloadLink <file_code>`\
  **Output:** A hotlink of the file ready to be downloaded.
  
- `getStreamingLink <file_code>`\
  **Output:** If the file is available through Uptostream, it returns a list of links for the different resolutions and languages available.

- `getUserData`\
  **Output:** Your account's details.

- `addFile <uptobox_url>`\
  **Details:** Until there's a dedicated API endpoint for this feature, this will **ONLY** work if you log in your Uptobox account, retrieve the XFSS cookie and **KEEP** your session active (don't log out). Then save the XFSS value in the file `xfss`.\
  The XFSS cookie expiration is set to 1 year.\
  **Output:** A simple `ok` if it was successfully added to your account.

- `updateFile <file_code>`\
  **Output:** `Updated` if you changed a property else `Nothing to update`.\
  **Options:**
  - `--name <new_name>`\
    New file name value.
  - `--public 0|1`\
    New public status.
  - `--desc <description>`\
    New description value.
  - `--passwd <password>`\
    New password value.

- `updateFilesPublic <public> <file_codes>`\
  **Output:** `Updated <nb_updated>` if you have updated at least 1 file else `Nothing to update`.\
  **Details:** `<file_codes>` is a list of file codes separated by commas and `<public>` equals to `0` or `1`.

- `convertPoints <points>`\
  **Details:** Exchange your UTB points in premium days.

- `createVoucher <time> <quantity>`\
  **Details**: `time` needs to be one of these values : `'30d'`, `'365d'` or `'730d'`.

- `setSSL 0|1` (**Requires an Uptobox premium account**)\
  Force `https` protocol for downloading.

- `setSecurityLock 0|1` (**Requires an Uptobox premium account**)\
  Enforce your account safety by preventing login from another country.

- `setDirectDL 0|1` (**Requires an Uptobox premium account**)\
  Automatically triggers the download when reaching an Uptobox link.

## Dependencies

- [filesize](https://www.npmjs.com/package/filesize)
- [uptobox-api](https://www.npmjs.com/package/uptobox-api)
- [minimist](https://www.npmjs.com/package/minimist)
