import { useAppStore } from 'src/stores/app';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from "quasar";

import { AppMenus as menus } from 'src/menus';
import { utils } from 'src/utils';
import { ApiService } from 'src/services/api';
import { StorageService } from 'src/services/storage';




export function useApp() {
	const store = useAppStore();
	const route = useRoute();
	const router = useRouter();
	const $q = useQuasar();
	const basePath = process.env.PUBLIC_URL || "/";

	const localStore = StorageService;

	function isDialogOpen(){
		return store.isDialogOpen;
	}
	function isDesktop() {
		return window.innerWidth >= 992;
	}
	
	function openImageDialog (pageData) {
		store.openImageDialog(pageData);
	}

	function openFullScreenLoading (msg) {
		store.openFullScreenLoading(msg);
	}

	function openPageDialog (pageData) {
		store.openPageDialog(pageData);
	}

	function openPageDrawer (pageData) {
		store.openPageDrawer(pageData);
	}
	
	function closeDialogs () {
		store.closeDialogs();
	}

	function setPageTitle (pageName, title) {
		if(pageName == route.name && title){
			document.title = title
		}
	}

	function flashMsg(title, detail = null, type = 'positive', position = 'top') {
		if(title){
			$q.notify({
				message: title,
				caption: detail,
				position,
				type,
				timeout: 3000
			});
		}
	}

	function navigateTo (path) {
		if(path && route.path !== path){
			router.push(path)
		}
	}

	function showPageRequestError(error) {
		console.error(error);
		const xhrRequest = error?.request;
		const defaultMsg = "Error processing request!";  // if error is not a api request error.
		let errorMsgs = [defaultMsg];
		if (xhrRequest) {
			let errorData = xhrRequest.response;
			if (typeof (errorData) === 'string') {
				try {
					// if error message is valid json data
					errorData = JSON.parse(errorData);
				}
				catch (ex) {
					//not a valid json. Display as simple message
					//console.error(ex);
				}
			}
			if (Array.isArray(errorData)) {
				errorMsgs = errorData;
			}
			else if (typeof (errorData) === 'object') {
				errorMsgs = Object.values(errorData);
			}
			else {
				errorMsgs = [errorData.toString()]
			}
		}

		store.showPageErrors(errorMsgs);
		if (xhrRequest?.status == 401) { 
			//token might have expired
			//logout user and navigate to login page
			
			localStore.removeLoginData();
			location.href = basePath;
		}
	}

	async function downloadReport(reportUrl, downloadFileName){
		try{
			$q.loading.show();
			const response = await ApiService.download(reportUrl);
			$q.loading.hide();
			
			const url = window.URL.createObjectURL(new Blob([response.data]));
			const link = document.createElement('a');
			link.href = url;
			link.setAttribute('download', downloadFileName);
			document.body.appendChild(link);
			link.click();
			link.remove();
		}
		catch(ex){
			$q.loading.hide();
			console.error(ex);
			flashMsg("Download file", "Unable to download file", "negative")
		}
	}

	async function printReport(reportUrl){
		try{
			$q.loading.show();
			const response = await ApiService.get(reportUrl);
			$q.loading.hide();

			let w = window.open(window.location.href, "_blank");
			w.document.open();
			w.document.write(response.data);
			w.document.close();
			w.window.onload = function () { w.window.print(); }
		}
		catch(ex){
			$q.loading.hide();
			console.error(ex);
			flashMsg("Print Report", "Unable to print report", "negative")
		}
	}

	async function exportPageRecords (pageExportFormats, currentPageUrl, pageName) {
		let actions = [];
		pageExportFormats.forEach(format => {
			actions.push(menus.exportFormats[format]);
		});

		let message = "Export";
		$q.bottomSheet({
			message,
			grid: false,
			actions
		}).onOk(action => {
			let selectedExport = menus.exportFormats[action.id];
			let queryParam = {
				export: action.id
			}
			let exportUrl = utils.setApiPath(currentPageUrl, queryParam);
			if(action.id === "print"){
				printReport(exportUrl)
			}
			else{
				let downloadFileName = `${utils.dateNow()}-${pageName}.${selectedExport.ext}`;
				downloadReport(exportUrl, downloadFileName);
			}
		}).onCancel(() => {
			// console.log('Dismissed')
		}).onDismiss(() => {
			// console.log('I am triggered on both OK and Cancel')
		})
	}

	return {
		basePath,
		menus,
		localStore,
		isDialogOpen,
		isDesktop,
		openFullScreenLoading,
		openImageDialog,
		openPageDialog,
		openPageDrawer,
		closeDialogs,
		setPageTitle,
		flashMsg,
		navigateTo,
		exportPageRecords,
		showPageRequestError,
		printReport,
		downloadReport,
	}
}