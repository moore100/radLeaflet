
export const AppMenus = {
    
	navbarTopRight: [],
	navbarTopLeft: [],
	navbarSideLeft: [
  {
    "path": "/home",
    "label": "Home",
    "icon": "extension",
    "iconcolor": "",
    "target": "",
    "submenu": []
  },
  {
    "path": "/users",
    "label": "Users",
    "icon": "extension",
    "iconcolor": "",
    "target": "",
    "submenu": []
  }
],
	userslistheader: [
  {
    "label": "Id",
    "align": "left",
    "sortable": false,
    "name": "id",
    "field": "id"
  },
  {
    "label": "Username",
    "align": "left",
    "sortable": false,
    "name": "username",
    "field": "username"
  },
  {
    "label": "",
    "align": "right",
    "sortable": false,
    "name": "btnactions",
    "field": ""
  }
],

    exportFormats: {
        print: {
			label: 'Print',
			color: 'blue',
            icon: 'print',
            id: 'print',
            ext: 'print',
        },
        pdf: {
			label: 'Pdf',
			color: 'red',
            icon: 'picture_as_pdf',
            id: 'pdf',
            ext: 'pdf',
        },
        excel: {
			label: 'Excel',
			color: 'green',
            icon: 'grid_on',
            id: 'excel',
            ext: 'xlsx',
        },
        csv: {
			label: 'Csv',
			color: 'teal',
            icon: 'grid_on',
            id: 'csv',
            ext: 'csv',
        },
    },
    
}