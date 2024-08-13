# Models

The models directory contains the project's various classes.

Thanks to the class, it's possible to have objects containing a certain number of variables, which avoids having dozens of variables in a file to talk about the same thing. 
In this interface, it's also to have only one observable object to modify at a time (to avoid certain synchronization problems).

Each class contains attributes and a constructor. No internal functions.

Now let's take a look at the different classes and what their attributes correspond to (I invite you to have a look at the file anyway, as I won't be describing the types specifically).

## Tag (tag.ts)

This class corresponds to a tag in the M3 model, with a few attributes enabling it to be managed in the application.

- <span style="color:blue">name</span> : Name of the tag
- id : Id of the tag
- tagsetID : Id