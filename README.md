# Uptobox CLI

## Requirement

- Retrieve your API token from your Uptobox account : [How to find my API token ?](https://docs.uptobox.com/#how-to-find-my-api-token)

- Install dependencies : `npm i`

## Usage

Arguments for index.js : 

- `listFiles`
  - `--path <constant>`\
    `<constant>` is defined in the object `paths` of the file `constants`.
  - `--limit 0...100`\
    A limit of 0 is the same than a limit of 100.
  - `--offset <offset>`
  - `--order <column_name>`\
    Order by `file_name`, `file_size`...
  - `--dir 'asc'|'desc'`
  - `--search <search_value>`\
    It's case insensitive and works with partial filenames.
  - `--field <search_field>`
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
- `updateFile --id <file_code> --name <new_name> [--public 0|1 --desc <description> --passwd <password>]`\
  **Details:** Arguments in square brackets are optional.\
  **Output:** `Updated` if you changed a property else `Nothing to update`.
- `updateFilesPublic --public 0|1 --ids "id1,id2,id3,..."`\
  **Details**: Pass file codes separated by a comma to `--ids`.\
  **Output:** `Updated <nb_updated>` if you have updated at least a file else `Nothing to update`.
- `convertPoints <points>`\
  **Details:** Exchange your UTB points in premium days.
- `createVoucher --time <time> --quantity <quantity>`\
  **Details**: `time` needs to be one of these values : '30d', '365d' or '730d'.
- `setSSL 0|1` *Requires an Uptobox premium account*
- `setSecurityLock 0|1` *Requires an Uptobox premium account*
- `setDirectDL 0|1` *Requires an Uptobox premium account*

## Dependencies

- [filesize](https://www.npmjs.com/package/filesize)
- [uptobox-api](https://www.npmjs.com/package/uptobox-api)
- [minimist](https://www.npmjs.com/package/minimist)
