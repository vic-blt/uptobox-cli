# Uptobox CLI

## Requirement

- Retrieve your API token from your Uptobox account : [How to find my API token ?](https://docs.uptobox.com/#how-to-find-my-api-token)

- Install dependencies : `npm i`

## Usage

Arguments for index.js : 

- `search <file_name>`\
  **Details:** It's case insensitive and works with partial filenames.\
  **Output:** A table with the properties `file_name`, `file_size` and `file_code` of the matched files.

- `list <folder_name>`\
  **Details:** `<folder_name>` has to be defined in `constants` this way : `folder_name: 'path'`.\
  **Output:** A list of `<folder_name>`'s files.

- `getDownloadLink <file_code>`\
  **Output:** A hotlink of the file ready to be downloaded.

- `getStreamingLink <file_code>`\
  **Output:** If the file is available through Uptostream, it returns a list of links for the different resolutions and languages available.

- `getAccount`\
  **Output:** Your account's details.

- `add <uptobox_url>`\
  **Details:** Until there's a dedicated API endpoint for this feature, this will **ONLY** work if you log in your Uptobox account, retrieve the XFSS cookie and **KEEP** your session active (don't log out). Then save the XFSS value in the file `xfss`.\
  The XFSS cookie expiration is set to 1 year.\
  **Output:** A simple `ok` if it was successfully added to your account.

- `update <file_code> <new_name> <is_public> <description> <password>`\
  **Details:** You can omit arguments but only if you're not providing an argument which is positioned after the ones omitted.\
  For example, you can omit `description` and `password` but if you want to provide `password`, you have to provide `description`.\
  **Output:** `Updated` if you changed a property else `Nothing to update`.

- `convertPoints <points>`\
  **Details:** Exchange your UTB points in premium days.

- `setSSL 0|1`

- `setSecurityLock 0|1`

- `setDirectDL 0|1`

## Dependencies

- [filesize](https://www.npmjs.com/package/filesize)
- [uptobox-api](https://www.npmjs.com/package/uptobox-api)

