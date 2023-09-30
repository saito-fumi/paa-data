/**
 * Copyright (c) 1998-2010 NetSuite, Inc.
 * 2955 Campus Drive, Suite 100, San Mateo, CA, USA 94403-2511
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * NetSuite, Inc. ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with NetSuite.
 */

/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @author Imai
 */
define(['N/error',
		'N/record',
		'N/search','N/runtime'],
function(error, record, search, runtime){

	function beforeSubmit(context){
		
	}
	
	
	/**
	 * Function definition to be triggered before record is loaded.
	 *
	 * @param {Object} scriptContext
	 * @param {Record} scriptContext.newRecord - New record
	 * @param {string} scriptContext.type - Trigger type
	 * @param {Form} scriptContext.form - Current form
	 * @Since 2015.2
	 */
	function afterSubmit(context){
		try{
			log.debug('context.type', context.type);
			log.debug('context.newRecord.id', context.newRecord.id);
			const u = runtime.getCurrentUser().id;
			log.debug('u', u);
			if(u == 2){
				return;	//�����𔲂���
			}
			if(context.type === context.UserEventType.DELETE){
				//���R�[�h�̍폜��
				/*
				const deletedRecord = context.oldRecord;
				var invTransId = null;
				for(var p = 0; p < deletedRecord.getLineCount({sublistId: 'item'}); p++){
					try{
						invTransId = deletedRecord.getSublistValue({
							sublistId: 'item',
							fieldId: 'custcol_ns_created_inv_trans',
							line: i
						});
						
						if(!isEmpty(invTransId)){
							record.delete({
								type: record.Type.INVENTORY_TRANSFER,
								id: invTransId,
							});
						}
					}catch(e){
						log.error('Delete Error:', e);
					}
					invTransId = null;
				}
				*/
				return;	//�����𔲂���
			}
			/*
			if(context.type !== context.UserEventType.CREATE){
				//���R�[�h�̍쐬���ȊO
				
				//return;	//�����𔲂���
			}
			*/
			
			const objRecord = context.newRecord;
			
			//�ۑ��������ʊi�[�p�z��
			var abArray = [];
			
			//��̏��̌������s
			var abSearchResultSet = search.create({
				type: search.Type.ITEM_RECEIPT,	//��̏�
				columns: [{							//�擾�Ώۍ���
					name: 'internalid',						//����ID
					sort: search.Sort.ASC					//�����\�[�g
				},{
					name: 'applyingtransaction'				//�g�����U�N�V������K�p
				},{
					name: 'location'						//�ړ���
				},{
					name: 'custcol_ns_completed_location'	//�ړ���
				},{
					name: 'department'						//����
				},{
					name: 'line'							//�s�ԍ�
				},{
					name: 'custcol_ns_created_inv_trans'	//�쐬���ꂽ�݌Ɉړ�
				},{
					name: 'quantity'						//����
				},{
					name: 'assembly'						//�A�Z���u��
				}],
				filters: [							//AND�ɂ��擾����(�t�B���^�[)
					{	name: 'internalid',				//����ID����v
						operator: search.Operator.IS,
						values: [context.newRecord.id]
					},{	name: 'applyingtransaction',	//�g�����U�N�V������K�p����łȂ�����
						operator: search.Operator.NONEOF,
						values: ['@NONE@']
					}
					/*,{	name: 'applyinglinktype',	//�g�����U�N�V������K�p����łȂ�����
						operator: search.Operator.NONEOF,
						values: ['@NONE@']
					},{	name: 'appliedtolinktype',	//�g�����U�N�V������K�p����łȂ�����
						operator: search.Operator.NONEOF,
						values: ['@NONE@']
					},{	name: 'linkedir',//�Ŋ���Ȗ�(�J�X�^���t�B�[���h)����łȂ�����
						operator: search.Operator.NONEOF,
						values: ['@NONE@']
					}*/
				]
			})
			.run();
			
			//�������s���ʂ����[�v
			abSearchResultSet.each(
				function(result){
					var ab = result.getValue(abSearchResultSet.columns[1]);	//�A�Z���u���\��
					if(!isEmpty(ab)){
						var abObj = {};
						abObj.ab = ab;
						abObj.locationFrom = result.getValue(abSearchResultSet.columns[2]);	//�ړ���
						abObj.locationTo = result.getValue(abSearchResultSet.columns[3]);	//�ړ���
						abObj.department = result.getValue(abSearchResultSet.columns[4]);	//����
						abObj.line = result.getValue(abSearchResultSet.columns[5]);			//�s
						abObj.createdInv = result.getValue(abSearchResultSet.columns[6]);	//�쐬���ꂽ�݌Ɉړ�
						abObj.quantity = result.getValue(abSearchResultSet.columns[7]);		//����
						abObj.item = result.getValue(abSearchResultSet.columns[8]);			//�A�Z���u���A�C�e��
						
						abArray.push(abObj);	//�z��Ɋi�[
					}
					return true;
				}
			);
			
			log.audit('abArray', abArray);	//���O�o��
			
			//���[�v�p�ϐ��i�[
//			var abFields = null;
			var invRecord = null;
			var invRecordId = null;
			var itemFields = null;
			var abInventoryDetail = null;
			var inventoryDetail = null;
			var hasSubrecord = false;
			var abRec = null;
			var numberedRecordId = null;
			//Loop transaction lines
			for(var i = 0; i < abArray.length; i++){
				try{
					if(isEmpty(abArray[i].createdInv)){
/*						//�A�Z���u���\���̏����擾
						abFields = search.lookupFields({
							type: search.Type.ASSEMBLY_BUILD,
							id: abArray[i].ab,
							columns: ['item', 'quantity']
						});
						*/
						
						//�A�C�e���̏����擾
						itemFields = search.lookupFields({
							type: search.Type.ITEM,
							id: abArray[i].item,
							columns: ['islotitem']
						});
						log.audit('itemFields', itemFields);
						
						//�݌Ɉړ��g�����U�N�V�������쐬
						invRecord = record.create({
							type: record.Type.INVENTORY_TRANSFER,
							isDynamic: true,
						});
						
						//�݌Ɉړ��g�����U�N�V�����F�{�f�B�t�B�[���h�Z�b�g
						invRecord.setValue({fieldId: 'customform', value: 146, ignoreFieldChange: false});											//�J�X�^���t�H�[��
						invRecord.setValue({fieldId: 'custbody_ns_wms_orderflg', value: false, ignoreFieldChange: false});							//NS_WMS�w���t���O
						invRecord.setValue({fieldId: 'subsidiary', value: objRecord.getValue({fieldId: 'subsidiary'}), ignoreFieldChange: false});	//�A��
						invRecord.setValue({fieldId: 'trandate', value: objRecord.getValue({fieldId: 'trandate'}), ignoreFieldChange: false});		//���t
						invRecord.setValue({fieldId: 'location', value: abArray[i].locationFrom, ignoreFieldChange: false});						//�ړ���
						invRecord.setValue({fieldId: 'transferlocation', value: abArray[i].locationTo, ignoreFieldChange: false});					//�ړ���
						invRecord.setValue({fieldId: 'department', value: abArray[i].department, ignoreFieldChange: false});						//����
						
						//�݌Ɉړ��g�����U�N�V�����F���C���t�B�[���h�Z�b�g
						invRecord.selectNewLine({sublistId: 'inventory'});	//�V�K�s�쐬
						invRecord.setCurrentSublistValue({sublistId: 'inventory', fieldId: 'item', value: abArray[i].item, ignoreFieldChange: false});	//�A�C�e��
						invRecord.setCurrentSublistValue({sublistId: 'inventory', fieldId: 'adjustqtyby', value: abArray[i].quantity, ignoreFieldChange: false});	//����
						
						hasSubrecord = invRecord.hasCurrentSublistSubrecord({
							sublistId: 'inventory',
							fieldId: 'inventorydetail'
						});
						log.debug('hasSubrecord', hasSubrecord);
						
						if(itemFields.islotitem){
							
							abRec = record.load({
								type: record.Type.ASSEMBLY_BUILD,
								id: abArray[i].ab,
								isDynamic: true,
							});
							abInventoryDetail = abRec.getSubrecord('inventorydetail');
							log.audit('abInventoryDetail', abInventoryDetail);
							abInventoryDetail.selectLine({sublistId: 'inventoryassignment',line: 0});
							/*
							var a = abInventoryDetail.getCurrentSublistValue({sublistId: 'inventoryassignment', fieldId: 'quantity'});
							log.debug('a', a);
							var b = abInventoryDetail.getCurrentSublistValue({sublistId: 'inventoryassignment', fieldId: 'receiptinventorynumber'});
							log.debug('b', b);
							var c = abInventoryDetail.getCurrentSublistValue({sublistId: 'inventoryassignment', fieldId: 'issueinventorynumber'});
							log.debug('c', c);
							var d = abInventoryDetail.getCurrentSublistValue({sublistId: 'inventoryassignment', fieldId: 'internalid'});
							log.debug('d', d);
							var e = abInventoryDetail.getCurrentSublistValue({sublistId: 'inventoryassignment', fieldId: 'inventorynumber'});
							log.debug('e', e);
							*/
							numberedRecordId = abInventoryDetail.getCurrentSublistValue({sublistId: 'inventoryassignment', fieldId: 'numberedrecordid'});
							log.debug('numberedRecordId', numberedRecordId);
							
							//���b�g�A�C�e���̏ꍇ
							inventoryDetail = invRecord.getCurrentSublistSubrecord({sublistId: 'inventory', fieldId: 'inventorydetail'});	//�݌ɏڍ׃��R�[�h���쐬
							inventoryDetail.selectNewLine({sublistId: 'inventoryassignment'});	//�s�I��
							inventoryDetail.setCurrentSublistValue({sublistId: 'inventoryassignment', fieldId: 'issueinventorynumber', value: numberedRecordId, ignoreFieldChange: true});	//���b�g�ԍ�
//							inventoryDetail.setCurrentSublistValue({sublistId: 'inventoryassignment', fieldId: 'receiptinventorynumber', value: numberedRecordId, ignoreFieldChange: true});	//���b�g�ԍ�
							inventoryDetail.setCurrentSublistValue({sublistId: 'inventoryassignment', fieldId: 'quantity', value: abArray[i].quantity, ignoreFieldChange: true});	//����
							inventoryDetail.commitLine({sublistId: 'inventoryassignment'});		//�s�R�~�b�g
							//inventoryDetail.commit();
							inventoryDetail = null;
						}
						invRecord.commitLine({sublistId: 'inventory'});		//�s�̃R�~�b�g
						
						
						//�݌Ɉړ��g�����U�N�V������ۑ�
						invRecordId = invRecord.save();
						
						if(!isEmpty(invRecordId)){
							//�ۑ��������Ă����ꍇ
							
							/*
							record.submitFields({
								type: record.Type.ITEM_RECEIPT,
								id: context.newRecord.id,
								values: {
									custbody_ns_created_inv_trans: invRecordId
								},
							});
							*/
							
							log.audit('Created INVENTORY_TRANSFER:', invRecordId);
							abArray[i].createdInv = invRecordId;	//�݌Ɉړ��g�����U�N�V�������L�^
						}else{
							throw new Error('�݌Ɉړ��`�[�̍쐬�Ɏ��s���܂����B');
						}
					}else{
						//�݌Ɉړ��g�����U�N�V���������[�h
						invRecord = record.load({
							type: record.Type.INVENTORY_TRANSFER,
							id: abArray[i].createdInv,
							isDynamic: true,
						});
						
						//�A�C�e���̏����擾
						itemFields = search.lookupFields({
							type: search.Type.ITEM,
							id: abArray[i].item,
							columns: ['islotitem']
						});
						log.audit('itemFields', itemFields);
						
						//�݌Ɉړ��g�����U�N�V�����F�{�f�B�t�B�[���h�Z�b�g
						invRecord.selectLine({sublistId: 'inventory',line: 0});	//�ŏ���1�s��
						invRecord.setCurrentSublistValue({sublistId: 'inventory', fieldId: 'adjustqtyby', value: abArray[i].quantity, ignoreFieldChange: false});	//����
						
						hasSubrecord = invRecord.hasCurrentSublistSubrecord({
							sublistId: 'inventory',
							fieldId: 'inventorydetail'
						});
						log.debug('hasSubrecord', hasSubrecord);
						
						if(itemFields.islotitem){
							//���b�g�A�C�e���̏ꍇ
							inventoryDetail = invRecord.getCurrentSublistSubrecord({sublistId: 'inventory', fieldId: 'inventorydetail'});	//�݌ɏڍ׃��R�[�h���擾
							inventoryDetail.selectLine({sublistId: 'inventoryassignment',line: 0});	//�ŏ���1�s��
							inventoryDetail.setCurrentSublistValue({sublistId: 'inventoryassignment', fieldId: 'quantity', value: abArray[i].quantity, ignoreFieldChange: true});	//����
							inventoryDetail.commitLine({sublistId: 'inventoryassignment'});		//�s�R�~�b�g
							//inventoryDetail.commit();
							inventoryDetail = null;
						}
						
						invRecord.commitLine({sublistId: 'inventory'});	//commit
						
						//�݌Ɉړ��g�����U�N�V������ۑ�
						invRecordId = invRecord.save();
						
						if(!isEmpty(invRecordId)){
							//�ۑ��������Ă����ꍇ
							
							/*
							record.submitFields({
								type: record.Type.ITEM_RECEIPT,
								id: context.newRecord.id,
								values: {
									custbody_ns_created_inv_trans: invRecordId
								},
							});
							*/
							
							log.audit('Created INVENTORY_TRANSFER:', invRecordId);
							abArray[i].createdInv = invRecordId;	//�݌Ɉړ��g�����U�N�V�������L�^
						}else{
							throw new Error('�݌Ɉړ��`�[�̕ύX�Ɏ��s���܂����B');
						}
					}
					
				}catch(e){
					log.audit('loop:e', e);
				}
			}
			
			log.audit('abArray2', abArray);
			
			////////////////////
			//��̏��̍X�V
			
			//��̏��̃��[�h
			const updatedIR = record.load({
				type: record.Type.ITEM_RECEIPT,
				id: context.newRecord.id,
				isDynamic: true,
			});
			
			//�ۑ��������ʂ����[�v
			for(i = 0; i < abArray.length; i++){
				updatedIR.selectLine({sublistId: 'item',line: (abArray[i].line - 1)});	//��̏����ׂ��w��
				updatedIR.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_ns_created_inv_trans', value: abArray[i].createdInv, ignoreFieldChange: false});	//�쐬���ꂽ�݌Ɉړ�
				updatedIR.commitLine({sublistId: 'item'});								//�s�̃R�~�b�g
				
				if(!isEmpty(abArray[i].ab)){
					record.submitFields({
						type: record.Type.ASSEMBLY_BUILD,
						id: abArray[i].ab,
						values: {
							custbody_ns_created_inv_trans : abArray[i].createdInv
						},
						options: {
							enableSourcing: false,
							ignoreMandatoryFields : true
						}
					});
				}
			}
			/*
			var rpaKey = null;
			for(i = 0; i < updatedIR.getLineCount({sublistId: 'item'}); i++){
				updatedIR.selectLine({sublistId: 'item',line: i});
				rpaKey = updatedIR.getCurrentSublistValue({
					sublistId: 'item',
					fieldId: 'custcol_ns_rpa_line'
				});
				
				updateRpaRecord(rpaKey);
			}
			*/
			//��̏��̕ۑ�
			updatedIR.save({
				enableSourcing: true,
				ignoreMandatoryFields: true
			});
			
		}catch (e){
			log.error('afterSubmit��O', e);
		}
	}
	
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
	}
	
	//RPA���R�[�h���X�V����
	function updateRpaRecord(key){
		//RPA���R�[�h�̌������s
		const rpaSearchResultSet = search.create({
			type: 'customrecord_ns_po_receipt_import',	//RPA���R�[�h
			columns: [{	//�擾�Ώۍ���
				name: 'internalid',		//����ID
				sort: search.Sort.ASC	//�����\�[�g
			}],
			filters: [										//AND�ɂ��擾����(�t�B���^�[)
				{	name: 'custrecord_ns_po_receipt_tranid',
					operator: search.Operator.IS,
					values: [key]
				}
			]
		})
		.run();
		
		var rpaRecId = null;
		
		//�������s���ʂ����[�v
		rpaSearchResultSet.each(
			function(result){
				rpaRecId = result.getValue(rpaSearchResultSet.columns[0]);
				if(!isEmpty(rpaRecId)){
					record.submitFields({
						type: 'customrecord_ns_po_receipt_import',
						id: rpaRecId,
						values: {
							custrecord_ns_po_receipt_created_flg: true,
							custrecord_ns_po_receipt_created_date: new Date()
						},
						options: {
							enableSourcing: false,
							ignoreMandatoryFields : true
						}
					});
				}
				rpaRecId = null;
				return true;
			}
		);
	}
	
	return {
		beforeSubmit: beforeSubmit,
		afterSubmit: afterSubmit
	};
});
