# Fitbit Activity in Obsidian

## What is it?

This is a user script for the [Templater](https://silentvoid13.github.io/Templater/) [Obsidian](https://obsidian.md/) plugin. 
The script will connect to the [fitbit API](https://dev.fitbit.com/) to fetch all your activity for a given day and format it as markdown.


If you like this script, please consider [buying me a coffee](https://www.buymeacoffee.com/Tiim).

## How do I use this?

1. Download the script [here](https://raw.githubusercontent.com/Tiim/Fitbit-Obsidian-Templater-Script/main/fitbit.js).
1. Put the script in your [templater script directory](https://silentvoid13.github.io/Templater/user-functions/script-user-functions.html).
2. Edit the DIR variable in the script to point to a folder of your choice relative to the obsidian vault root folder (the default folder is `misc`). 
  If this folder does not yet exist it will be created when the user script is being run for the first time. 
  The file "fibit.json" will be created inside it.
3. Create a templater template with the following content: 
  `<% tp.user.fitbit(tp.file.creation_date()) %>`
4. Run the templater script (by inserting the template to an existing file) to create the "fitbit.json" file. 
  The error message is expected behavior and can be ignored.
5. Go to [tiim.ch/fitbit-oauth2-token/](https://tiim.ch/fitbit-oauth2-token/) and follow the instructions 
  to get your fitbit authentication code.
6. Edit the file "fibit.json" with a text editor and replace its content with the JSON document given in the step above.
7. Run the templater script again, the file "fitbit.json" will be updated and your activities of the day 
  will be inserted to the note.


## Example of data returned from the script

### **Fitness**
🕰 Start Time:: 16:40
🤸‍♂️ Sport:: Fitness
📏 Time:: 37
⏱️ Distance:: 
💓 Heartrate:: 110
✨ Motivation::

```fitness
<enter the fitness plan here>
```
