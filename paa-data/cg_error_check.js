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
define(['N/log', 'N/error', 'N/record', 'N/search', 'N/ui/serverWidget','N/email','N/workflow','N/url','N/runtime'],
function (log, error, record, search, serverWidget, email, workflow, url,runtime){

	function afterSubmit(context){
		//暫定対応>>ユーザーロールでCeligoの連携済みフラグ更新処理を対象外にする
		var userRole = runtime.getCurrentUser().role;
		log.debug('role',userRole);
		if(userRole == 3 || userRole == 1262){
			return;
		}
		//暫定対応end

		//標準の出荷日をNS_WMS_出庫予定日へ転記する。
		try{
			const newRec = context.newRecord;	//新規レコードを取得
			const tranDate = newRec.getValue({fieldId: 'trandate'});	//日付を取得
			const shipDate = newRec.getValue({fieldId: 'shipdate'});	//出荷日を取得

			//出荷日が空白でない場合
			if(!isEmpty(shipDate)){
				//出荷日をNS_WMS_出庫予定日へ転記
				record.submitFields({
					type: record.Type.TRANSFER_ORDER,
					id: newRec.id,
					values: {
						custbody_ns_wms_shipdate: shipDate
					}
				});
			}
			
			const cf = newRec.getValue({fieldId: 'customform'});	//カスタムフォームを取得
			//log.debug('cf', cf);
			
			//ステータスを取得
			const status  = search.lookupFields({
				type: search.Type.TRANSFER_ORDER,
				id: newRec.id,
				columns: ['statusref']
			}).statusref[0].value;  
			
			log.debug('newRec', newRec);
			log.debug('status', status);
			
			//NS_エラーチェックを行うを取得
			const needErrorCheck = search.lookupFields({
				type: search.Type.TRANSFER_ORDER,
				id: newRec.id,
				columns: ['custbody_ns_need_error_check']
			}).custbody_ns_need_error_check;  
			//log.debug('needErrorCheck', needErrorCheck);
						
			if(needErrorCheck){	
				//配送保留の場合
				if(status == 'pendingFulfillment'){ 
					
					const tranId = newRec.getValue({fieldId: 'tranid'});	//ドキュメント番号を取得
					const internalId = newRec.getValue({fieldId: 'id'});	//トランザクション内部IDを取得
					var qa = 0;
					var qty = 0;
					var item = null;

					//数量・利用可能数を取得
					for(var i = 0; i < newRec.getLineCount({sublistId: 'item'}); i++){
		
						item = null;
						
						item =  newRec.getSublistValue({
							sublistId: 'item',
							fieldId: 'item',
							line: i
						});
						
						//log.debug('item', item);

						//数量を取得
						qty = newRec.getSublistValue({
							sublistId: 'item',
							fieldId: 'quantity',
							line: i
						})|0;  
						
						//利用可能数を取得
						qa = newRec.getSublistValue({
							sublistId: 'item',
							fieldId: 'quantityavailable',
							line: i
						})|0;  
						
						log.debug('qty', qty);
						log.debug('qa', qa);

						var tranUrl = resolveRecordUrl(internalId);	//レコードURL生成						
						//log.debug('url',tranUrl);
						//rin: 2023.5.24追加 >> 送信者(承認者)および受信者を取得
						var sendId = newRec.getValue({fieldId: 'custbody_ns_app_user'});	 
						var recipientId = newRec.getValue({fieldId: 'custbody_ns_req_user'});	//メール受信者(申請者)を取得
						//log.debug('recipientId',recipientId);

						
						if(qa - qty < 0){
							log.error('e', '利用可能在庫数が不足しているため承認保留に戻しました。 ドキュメント番号:' + tranId);
							const roll = newRec.getValue({fieldId: 'custbody_ns_req_roll'});  //NS_申請者ロールを取得

                             //jo: 2023.5追加 >> NS_トランザクション承認ステータスを申請前に変更
							  record.submitFields({
								type: record.Type.TRANSFER_ORDER,
								id: newRec.id,
								values: {
									custbody_ns_tran_wf_status: '1',
									
									custbody_ns_approve_error: true
								},
								options: {
									 enableSourcing: false,
									ignoreMandatoryFields : true
								}
							});
							//ステータスを承認保留に変更
							record.submitFields({
								type: record.Type.TRANSFER_ORDER,
								id: newRec.id,
								values: {
									orderstatus: 'A',	//Aは承認保留
									custbody_ns_approve_error: true,	//custbody_ns_approve_error → NS_承認時引当エラー
																	
								},
								options: {
									 enableSourcing: false,
									 ignoreMandatoryFields : true
								}
							});	
														
							if(tranId == '自動生成'){
								
							}else{//rin: 2023.5.24追加 >> 修正内容：message
								var customError = error.create({
									name: 'NS_ITEMS_ARE_IN_SHORT_SUPPLY',
									message: '<b><big>利用可能在庫数が不足しているため承認できませんでした。</br></br>ドキュメント番号:' + tranId + ' </b></big>' + '<font color="#0000ff"></br></br>--------------------------------------------------------------------------</br></br><big><b>【修正手順】</b></big>' + '</br></br><big><b> 1.アイテムの「可能」が「数量」より下回る行の数量を利用可能数量以内に修正してください。</br></br> 2.修正完了後、再申請・承認いただくようお願いいたします。</br></br>※申請者側にも修正手順を記載したエラー通知が配信されます。 </br></br>--------------------------------------------------------------------------</b></big></br></br></font>',
									notifyOff: false
								});								
														
								sendMailOnFailure(sendId,recipientId,tranId,tranUrl);	//承認不成功のメール送信

								var WFrecordID = newRec.getValue({fieldId: 'id'});	//トランザクション内部IDを取得 
								var WFactionID = 'workflowaction1931';	//ワークフローアクション内部IDを設定                          
								
								triggerWorkflow(WFrecordID,WFactionID);	//Script用エラー処理ボタンを実行
								
								throw customError;

							}							
						}						
					}
					//承認成功のメール送信
					sendMailOnSuccess(sendId,recipientId,tranId,tranUrl);
				}
			}

		}catch(e){
			if(e.name == 'NS_ITEMS_ARE_IN_SHORT_SUPPLY'){
				throw e.message;
			}
			log.error('afterSubmit: ', e);
		}
	}

	//空値判定用関数 - 空値は true を返す
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
	}

	//rin: 2023.5.24追加 >> 承認不成功のメール送信
	function sendMailOnFailure(sendId,recipientId,tranId,tranUrl){
		email.send({
			author: sendId,
			recipients: recipientId,
			subject: '【要確認】移動伝票が承認できませんでした' + tranId,
			body: '移動伝票 : ' + tranId + ' 利用可能在庫数が不足しているため承認できませんでした。\r\n' + '\r\n ----------------【修正手順】---------------- \r\n' + ' 1.アイテムの「可能」が「数量」より下回る行の数量を利用可能数量以内に修正してください。' + ' \r\n 2.修正完了後、再申請・承認いただくようお願いいたします。' + '\r\n \r\n レコード表示：' + tranUrl + ' \r\n ',//メールコンテンツ+伝票リンク
		});
		log.debug('Failure','送信済み');
	}

	//rin: 2023.5.24追加 >> 承認成功のメール送信
	function sendMailOnSuccess(sendId,recipientId,tranId,tranUrl){	 
		email.send({
			author: sendId,//sendId
			recipients: recipientId,
			subject: '移動伝票が承認されました' + tranId,
			body: '移動伝票 : ' + tranId + 'が承認されました。'+ '\r\n レコード表示：' + tranUrl,
		});
		log.debug('Success','送信済み');
	}

	//jo: 2023.5.23追加 >> 指定のボタン「Script用エラー処理ボタン」を実行
	function triggerWorkflow(WFrecordID,WFactionID){
		var workflowInstanceId = workflow.trigger({
			recordType: 'transferorder',
			recordId: WFrecordID,
			workflowId: 'customworkflow_ns_trnford_wf_14',
			actionId:WFactionID
		});
		log.debug('Button','実行完了');
		
	}

	//2023.5.24 作成者：rin レコードURL生成
    function resolveRecordUrl(internalId) {
            var scheme = 'https://';
            var host = url.resolveDomain({
                hostType: url.HostType.APPLICATION
            });
			var relativePath = url.resolveRecord({
				recordType: 'transferorder',
				recordId: internalId,
				isEditMode: false
			});
            var output = scheme + host + relativePath;
			return output;
        }
        
	
	return {
		afterSubmit: afterSubmit
	};
});
