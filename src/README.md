# Src folder and Help

This file is used to explain the important elements in this folder, but also to explain how to perform certain tasks.

_______

- [Src folder and Help](#src-folder-and-help)
  - [Elements of the /src/folder](#elements-of-the-srcfolder)
  - [HELP](#help)
    - [Currently supported file extensions](#currently-supported-file-extensions)
    - [Change the port/address on which server requests are made](#change-the-portaddress-on-which-server-requests-are-made)
    - [Create a new element (component, service, class)](#create-a-new-element-component-service-class)
    - [Create a new page](#create-a-new-page)
    - [Add new file extension](#add-new-file-extension)
    - [Change the URL of the image path (or delete it)](#change-the-url-of-the-image-path-or-delete-it)

_______

## Elements of the /src/folder

- **/app/**  :  This directory contains the contents of the **angular application** (i.e. the interface). This is where you'll find the elements you need to modify/add to impact the application's functionality and visual appearance.

- **/assets/** : Directory containing the different assets of the project (images, icons, font,...).

- **styles.css :** : File containing some css elements used for ALL the application’s elements (font declaration, etc...). This is where the global style variables are located (for colors). So if you want to change the style of the interface, or allow different styles, that’s what it will be about.

- **proxy.conf.json** : Allows you to avoid having to set the server’s localhost (https://localhost:5001) for each request. If you need to change the port or address where/api requests are made, it is in this file that it happens. Having the proxy file avoids putting the localhost to each request, so if you have to change there is just this file.



## HELP
### Currently supported file extensions
--> **jpg, png, jpeg, gif, webp, svg, bmp, ico, mp3, wav** and link to **youtube** and **spotify**. (Note, this is not just any link, you need links accessible through iframe. Often it’s with an "embed" in the link).

- For **Spotify**  just add **embed before track** : https://open.spotify.com/embed/track/2O6X9nPVVQSefg3xOQAo5u.

- For **YouTube**, it’s more complicated, you have to go to a video, click on share, go to “integer” and copy the link present in the iframe proposed by youtube. Just adding embed will not work (not 100%).

### Change the port/address on which server requests are made
Go into  src/proxy.conf.json file, and change the url (not the rest). 

### Create a new element (component, service, class)

    ng g (component|service|class) path(from app)/name

### Create a new page
- Create a new component  
- In ***app-rooting.module.ts***, add in "routes" : 
`{ path: 'name-page', component: NameComponent }`  
- Then, in the .ts file that must redirect to this new page
`constructor(private router: Router) {}`
…  
`this.router.navigate(['/name-page]);`

### Add new file extension 
- Change **getMediasType** in *CellsDisplayComponent* (add the case of the new extension).
- Same in *GetCellStateService* **getAllMedias**.
- Then, depending on the case you need for display in HTML, add the extension in one of the existing elements or create a new one in the HTML files of components *CellsDisplayComponent*, *CellStateSingleComponent*, *CellStateGridComponent*.
	
  
###  Change the URL of the image path (or delete it)

For current images (present in /assets/images), the current database did not contain the exact path. So we had to add this.

We add, in the ***cell-state.components.ts* (line 44)** and ***cell-display.component.ts* (lines 128, 145 and 160)**, the path (raw code) before the url coming from the database (unless the url is a spotify or youtube url). 

We add, in the cell-state.components.ts (line 44) and cell-display.component.ts (lines 128, 145 and 160), the path (raw code) before the url coming from the database (unless the url is a spotify or youtube url). 

**Warning** : an angular interface is running on the browser. If you want to access files locally, you must put them in the/assets/ folder of the interface, otherwise angular will not be able to access them. Several solutions: store the elements on the net, create a server with api that just returns the objects (not on functions) or then find a way to allow angular to access the rest of the computer.
