/**
 * Copyright (c) 1998-2017 NetSuite, Inc.
 * 2955 Campus Drive, Suite 100, San Mateo, CA, USA 94403-2511
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * NetSuite, Inc. ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with NetSuite.
 *
 */

/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */

/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       20 Jun 2021     Keito Imai       Initial version
 */
define(['N/log', 'N/error', 'N/record', 'N/search', 'N/ui/serverWidget'],
function (log, error, record, search, serverWidget){
	function beforeLoad(context){
		try{
			log.debug('context.type', context.type);
			if(context.type === context.UserEventType.CREATE){
				const form = context.form;
				const categoryField = form.getSublist({id: 'expense'}).getField({id: 'category'});
				categoryField.updateDisplayType({
					displayType: serverWidget.FieldDisplayType.DISABLED
				});
			}
		}catch(e){
			log.error('beforeLoad Error', e);
		}
	}
	
	function beforeSubmit(context){
	}
	
	function afterSubmit(context){
	}
	//空値判定用関数 - 空値は true を返す
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
	}
	
	//日付を yyyy/MM/dd 形式に変換して返却
	function date2strYYYYMMDD(d){
		return d.getFullYear() + '/' + (('00' + (d.getMonth() + 1)).slice(-2)) + '/' + ('00' + d.getDate()).slice(-2);
	}
	
	//日付を yyyy/M/d 形式に変換して返却
	function date2strYYYYMD(d){
		return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
	}
	
	return {
		beforeLoad: beforeLoad
	};
});
