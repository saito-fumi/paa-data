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
 * 1.00       17 Dec 2021     Keito Imai       Initial version
 */
define(['N/log', 'N/error', 'N/record', 'N/search'],
function (log, error, record, search){
	function beforeLoad(context){
		return;
	}
	
	function beforeSubmit(context){
		return;
	}
	
	function afterSubmit(context){
		try{
			log.debug('afterSubmit', context);
			
			const newRec = context.newRecord;		//新規レコードを取得
			log.debug('newRec', newRec);
			
			const newRecId = context.newRecord.id;	//新規レコードのIDを取得
			log.debug('newRecId', newRecId);

			
			const bankType = newRec.getValue({fieldId: 'custrecord_2663_entity_bank_type'});
			log.debug('bankType', bankType);
			
			if(bankType != 1){
				//プライマリでなければ
				
				//処理を抜ける
				return;
			}
			
			const parentVendor = newRec.getValue({fieldId: 'custrecord_2663_parent_vendor'});		//親仕入先
			const parentCusomer = newRec.getValue({fieldId: 'custrecord_2663_parent_customer'});	//親顧客
			const parentEmp = newRec.getValue({fieldId: 'custrecord_2663_parent_employee'});		//親従業員
			log.debug('parentVendor', parentVendor);
			log.debug('parentCusomer', parentCusomer);
			log.debug('parentEmp', parentEmp);
			
			const bankInfoObj = {};
			bankInfoObj.custrecord_2663_entity_bank_no = newRec.getValue({fieldId: 'custrecord_2663_entity_bank_no'});
			bankInfoObj.custrecord_2663_entity_branch_no = newRec.getValue({fieldId: 'custrecord_2663_entity_branch_no'});
			bankInfoObj.custrecord_2663_entity_acct_no = newRec.getValue({fieldId: 'custrecord_2663_entity_acct_no'});
			bankInfoObj.custrecord_2663_entity_acct_name = newRec.getValue({fieldId: 'custrecord_2663_entity_acct_name'});
			bankInfoObj.custrecord_2663_entity_bank_name = newRec.getValue({fieldId: 'custrecord_2663_entity_bank_name'});
			bankInfoObj.custrecord_2663_entity_branch_name = newRec.getValue({fieldId: 'custrecord_2663_entity_branch_name'});
			bankInfoObj.custrecord_2663_acct_type = newRec.getValue({fieldId: 'custrecord_2663_acct_type'});
			bankInfoObj.custrecord_2663_entity_iban = newRec.getValue({fieldId: 'custrecord_2663_entity_iban'});
			bankInfoObj.custrecord_2663_entity_address1 = newRec.getValue({fieldId: 'custrecord_2663_entity_address1'});
			bankInfoObj.custrecord_2663_entity_address2 = newRec.getValue({fieldId: 'custrecord_2663_entity_address2'});
			bankInfoObj.custrecord_2663_entity_bic = newRec.getValue({fieldId: 'custrecord_2663_entity_bic'});
			//bankInfoObj.custrecord_2663_entity_bank_acct_type = newRec.getValue({fieldId: 'custrecord_2663_entity_bank_acct_type'});
			
			
			if(!isEmpty(parentVendor)){
				//親仕入先が存在する場合

				var parent = parentVendor;
				var type = 'V';
			}else if(!isEmpty(parentCusomer)){
				//親顧客が存在する場合
				
				var parent = parentCusomer;
				var type = 'C';
			}else if(!isEmpty(parentEmp)){
				//親従業員が存在する場合

				var parent = parentEmp;
				var type = 'E';
			}else{
				//親が存在しない場合
				
				//処理を抜ける
				return;
			}
			
			log.debug('parent', parent);
			log.debug('type', type);
			
			updateEntityPrimaryBank(type, parent, newRecId, bankInfoObj);	//親エンティティのプライマリ銀行を更新
			
			return;
		}catch(e){
			log.error('afterSubmit: ', e);
		}
	}
	//空値判定用関数 - 空値は true を返す
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
	}
	
	//親エンティティのプライマリ銀行を更新
	function updateEntityPrimaryBank(type, entity, bankId, bankInfoObj){
		log.debug('updateEntityPrimaryBank - START', 'updateEntityPrimaryBank - START');
		try{
			if(type == 'V'){
				var recordType = record.Type.VENDOR;
			}else if(type == 'C'){
				var recordType = record.Type.CUSTOMER;
			}else if(type == 'E'){
				var recordType = record.Type.EMPLOYEE;
			}else {
				return;
			}
			
			log.debug('bankInfoObj', bankInfoObj);
			
			record.submitFields({
				type: recordType,
				id: entity,
				values: {
					custentity_ns_primary_bank: bankId,
					custentity_ns_primary_bank_bank_no: bankInfoObj.custrecord_2663_entity_bank_no,
					custentity_ns_primary_bank_branch_no: bankInfoObj.custrecord_2663_entity_branch_no,
					custentity_ns_primary_bank_bank_acc_no: bankInfoObj.custrecord_2663_entity_acct_no,
					custentity_ns_primary_bank_bank_acc_name: bankInfoObj.custrecord_2663_entity_acct_name,
					custentity_ns_primary_bank_bank_name: bankInfoObj.custrecord_2663_entity_bank_name,
					custentity_ns_primary_bank_branch_name: bankInfoObj.custrecord_2663_entity_branch_name,
					custentity_ns_primary_bank_acc_type: bankInfoObj.custrecord_2663_acct_type,
					custentity_ns_primary_bank_os_iban: bankInfoObj.custrecord_2663_entity_iban,
					custentity_ns_primary_bank_os_ba1: bankInfoObj.custrecord_2663_entity_address1,
					custentity_ns_primary_bank_os_ba2: bankInfoObj.custrecord_2663_entity_address2,
					custentity_ns_primary_bank_os_swift: bankInfoObj.custrecord_2663_entity_bic,
				},
				options: {
					enableSourcing: false,
					ignoreMandatoryFields : true
				}
			});
			
			log.debug('updateEntityPrimaryBank - END', 'updateEntityPrimaryBank - END');
		}catch(e){
			log.error('updateEntityPrimaryBank - ERROR', e);
		}finally{
			return;
		}
	}
	
	return {
		//beforeLoad: beforeLoad,
		//beforeSubmit: beforeSubmit,
		afterSubmit: afterSubmit
	};
});
