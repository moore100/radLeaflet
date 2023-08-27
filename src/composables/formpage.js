import { reactive, useAttrs } from "vue";
import { useApp } from 'src/composables/app';
import { ApiService } from 'src/services/api';
import useVuelidate from '@vuelidate/core';
import { useQuasar } from "quasar";
export function useForm({ props, formData, rules = {}, afterSubmit, beforeSubmit }) {

	const $q = useQuasar();
	const attrs = useAttrs();

	const app = useApp();
	const state = reactive({
		id: null,
		pageReady: false,
		submitted: false,
		saving: false,
	});

	const $v = useVuelidate(rules, formData);

	function validateForm() {
		return !$v.value.$invalid;
	}

	async function submitForm() {
		state.submitted = true;
		if (beforeSubmit !== undefined) {
			if (!beforeSubmit()) { return; }
		}

		if (!validateForm()) {
			app.flashMsg(props.formValidationError, props.formValidationMsg, "negative");
			return;
		}

		const confirmMsg = props.msgBeforeSave;
		if (confirmMsg) {
			const title = props.msgTitle;
			$q.dialog({
				title: title,
				message: confirmMsg,
				cancel: true,
				persistent: true,
			}).onOk(async () => {
				saveFormData();
			});
		}
		else {
			saveFormData();
		}
	}

	async function saveFormData() {
		state.saving = true;
		try {
			const response = await ApiService.post(props.apiPath, formData);
			if (attrs.onSubmitted) {
				attrs.onSubmitted(response);
			}
			else if (afterSubmit) {
				afterSubmit(response);
			}
		}
		catch (err) {
			app.showPageRequestError(err);
		}
		finally {
			state.submitted = false;
			state.saving = false;
		}
	}

	function getErrorClass(field) {
		const isInvalid = ($v.value[field]?.$invalid || false) && state.submitted;;
		return { "p-invalid": isInvalid };
	}

	function isFieldValid(field) {
		return ($v.value[field]?.$invalid || false) && state.submitted;
	}

	function getFieldError(field) {
		const fieldErrors = $v.value[field]?.$silentErrors;
		if (fieldErrors?.length) {
			return fieldErrors[0].$message; //return the first error
		}
		return null;
	}

	return {
		validateForm,
		submitForm,
		getErrorClass,
		getFieldError,
		isFieldValid,
		formData,
		state,
	}
}