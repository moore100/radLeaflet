
import { route } from 'quasar/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */


function passRouteToProps(route){
	return {
		queryParams: route.query,
		fieldName: route.params.fieldName, 
		fieldValue: route.params.fieldValue
	}
}


let routes = [{
	name: 'main',
	path: '/',
	component: () => import('layouts/MainLayout.vue'),
	children: [
		
		{ 
			path: '/home',
			name: 'home', 
			component: () => import('pages/home/home.vue'), 
			props: true 
		},//Dashboard routes


//users routes
		{
			path: '/users/:fieldName?/:fieldValue?',
			name: 'userslist',
			component: () => import('pages/users/list.vue'),
			props: route => passRouteToProps(route)
		},
		{ 
			path: '/users/view/:id', 
			name: 'usersview', 
			component: () => import('pages/users/view.vue'), 
			props: true 
		},
		{ 
			path: '/users/add', 
			name: 'usersadd', 
			component: () => import('pages/users/add.vue'), 
			props: true 
		},
		{ 
			path: '/users/edit/:id', 
			name: 'usersedit', 
			component: () => import('pages/users/edit.vue'), 
			props: true 
		},

		
		
		
		

		//Error pages
		{ path:  '/error/forbidden', name: 'forbidden',  component: () => import('pages/errors/forbidden.vue') },
		{ path: '/error/notfound',  name: 'notfound', component: () => import('pages/errors/pagenotfound.vue') }
	],
	
	},
	{ path: '/:catchAll(.*)*', component: () => import('pages/errors/pagenotfound.vue') }
];

export default route(async function () {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE == 'history' ? createWebHistory : createWebHashHistory)
	
	const mainRoute = routes.find(x => x.name = "main");
	
	
	const Router = createRouter({
	scrollBehavior(to, from, savedPostion){
		if(savedPostion) return savedPostion;
		return { top:0 }
	},
    routes,
    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })
  return Router
})

