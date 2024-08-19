# Application

This directory contains the contents of the **angular application** (i.e. the interface). This is where you'll find the elements you need to modify/add to impact the application's functionality and visual appearance.

Here are the **important files and folders** :

 - **app-rooting.module.ts** :  File in which application pages are defined. A Web page is linked to a specific component. This is where you can add a Web page and then make the links. (For “*How to add a page*”, see the technical documentation in */src/*).
 
 - **/components/** :  Directory containing all interface components. A **component** is a group of Typescript, HTML and CSS files (optional) corresponding to a part or all of the page visible in the browser. Each component has its own folder. It is possible to add a component of another component (at the HTML level). Thus we have a hierarchy of components and can separate the pieces of code. Having different components also allows to juggle between two components, to hide one when you want (like a popup), etc...
 
 - **/models/** :  Directory containing all interface classes. A **class** allows you to have objects containing many variables, which avoids having dozens of variables in the same file to talk about the same thing.
 
 - **/services/** :  Directory containing all the services of the interface. A **service** is a piece of code, accessible by all elements of the interface and which is constantly loaded. This allows for variables, observables and functions common to several different components or services.

