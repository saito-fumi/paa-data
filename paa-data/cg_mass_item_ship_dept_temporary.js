/**
 * @NApiVersion 2.x
 * @NScriptType MassUpdateScript
 * @NModuleScope SameAccount
 */
define(['N/record'],
/**
 * @param ‌{‌record} record
 */
function(record) {

    /**
     * Definition of Mass Update trigger point.
     *
     * @param {Object} params
     * @param {string} params.type - Record type of the record being processed by the mass update
     * @param {number} params.id - ID of the record being processed by the mass update
     *
     * @since 2016.1
     */
    function each(params) {
		var rec = record.load({
			type: params.type,
			id: params.id,
			isDynamic: true
		}); //loads the record


		// var newDept1 = '';
		// var newDept2 = '';
		// var newDept3 = '';

		//the G/L impact of a voided transaction cannot be changed、
		if (rec.getValue('voided') == 'F') {

			log.debug('tranID',rec.getValue({fieldId: 'tranid'}));
				
			var itemCount = rec.getLineCount({sublistId: 'item'}); //アイテム明細行数			

			for(var i = 0; i <= itemCount-1; i++){

				var oldDept = rec.getSublistValue({
					sublistId: 'item',
					fieldId: 'department',
					line: i
				});

				log.debug('dept',oldDept);

				if(oldDept == 460){ //広報
					//行選択
					rec.selectLine({
						sublistId: 'item',
						line: i
					});

					//新しい部門をセットする
					rec.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'department',
						value: 590, //カルチャー
						ignoreFieldChange: true
					});

					//次の行へ
					rec.commitLine({
						sublistId: 'item'
					}); 
					log.debug('広報→カスチャー: 590', i + '行更新完了');

				}else if(oldDept == 457){ //ECモール
					//行選択
					rec.selectLine({
						sublistId: 'item',
						line: i
					});

					//新しい部門をセットする
					rec.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'department',
						value: 1878, //ECモール運営
						ignoreFieldChange: true
					});

					//次の行へ
					rec.commitLine({
						sublistId: 'item'
					}); 
					log.debug('ECモール→運営: 1878', i + '行更新完了');

				}else if(oldDept == 353){ //CX
					//行選択
					rec.selectLine({
						sublistId: 'item',
						line: i
					});

					//新しい部門をセットする
					rec.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'department',
						value: 354, //CRM
						ignoreFieldChange: true
					});
					//次の行へ
					rec.commitLine({
						sublistId: 'item'
					}); 
					log.debug('CX→CRM: 354', i + '行更新完了');

				}else if(oldDept == 166){ //マーケティング2部
					//行選択
					rec.selectLine({
						sublistId: 'item',
						line: i
					});

					//新しい部門をセットする
					rec.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'department',
						value: 167, //マーケティング部：オンライン新規
						ignoreFieldChange: true
					});
					//次の行へ
					rec.commitLine({
						sublistId: 'item'
					}); 					
					log.debug('MK2→MK ONLINE: 167', i + '行更新完了');

				}else if(oldDept == 253){ //リテ本部
					//行選択
					rec.selectLine({
						sublistId: 'item',
						line: i
					});

					//新しい部門をセットする
					rec.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'department',
						value: 464, //プロマネ
						ignoreFieldChange: true
					});
					//次の行へ
					rec.commitLine({
						sublistId: 'item'
					}); 					
					log.debug('リテ本→プロセス: 464', i + '行更新完了');

				}else if(oldDept == 364){ //Asean
					//行選択
					rec.selectLine({
						sublistId: 'item',
						line: i
					});

					//新しい部門をセットする
					rec.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'department',
						value: 182, //アジアパシフィック
						ignoreFieldChange: true
					});
					//次の行へ
					rec.commitLine({
						sublistId: 'item'
					}); 
					log.debug('Asean→アジアパシフィック: 182', i + '行更新完了');

				}else if(oldDept == 363){ //Greater China
					//行選択
					rec.selectLine({
						sublistId: 'item',
						line: i
					});

					//新しい部門をセットする
					rec.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'department',
						value: 571, //中国事業部
						ignoreFieldChange: true
					});
					//次の行へ
					rec.commitLine({
						sublistId: 'item'
					}); 
					log.debug('China→中国事業部: 571', i + '行更新完了');
				}

			}
		} //end if

		//save the record
		var recordId = rec.save({
			ignoreMandatoryFields: true
		}); 
    }

    return {
        each: each
    };

});