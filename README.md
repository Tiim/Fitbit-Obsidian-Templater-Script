# Fitbit Activity in Obsidian

## What does it do?

Insert a list of your fitbit activities into an obsidian note.
If you like this script, please consider [buying me a coffee](https://www.buymeacoffee.com/Tiim).

## How to use:

1. Put this script in your templater script directory.
2. Edit the DIR variable below to point to a folder of your choice. 
  This folder must exist. The file "fibit.json" will be created inside it.
3. Create a templater template with the following content: 
  `<% tp.user.fitbit(tp.file.creation_date()) %>`
4. Run the templater script (by inserting the template to an existing file) to create the "fitbit.json" file. 
  The error message is expected behavior and can be ignored.
5. Go to [tiim.ch/fitbit-oauth2-token/](https://tiim.ch/fitbit-oauth2-token/) and follow the instructions 
  to get your fitbit authentication code.
6. Edit the file "fibit.json" and replace its content with the JSON document given in the step above.
7. Run the templater script again, the file "fitbit.json" will be updated and your activities of the day 
  will be inserted to the note.


## Example

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
