/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope Public
 * @author Keito Imai
 */
 /**
 * Module Description
 *
 * Version	Date					Author			Remarks
 * 1.00		2021/06/30				Keito Imai		Initial Version
 * 
 */

define(['N/ui/message',
		'N/ui/dialog',
		'N/runtime',
		'N/record',
		'N/search'],
function(message, dialog, runtime, record, search){
	function pageInit(context){
		//alert('test');
		console.log('pageInit');
	}

	function saveRecord(context){
		console.log('itemCheckStart');
		const currentRecord = context.currentRecord;	//currentRecord���擾
		const itemId = (''+currentRecord.getValue({fieldId: 'itemid'})).trim();
		console.log('itemId:' + itemId);
		
		const internalId = currentRecord.id;
		log.debug('internalId', internalId);
		
		if(!isHanEisu(itemId)){
			alert('�A�C�e����/�ԍ��ɔ��p�p���� -(�n�C�t��), _(�A���_�[�X�R�A) �ȊO�͋��e����Ă��܂���B');
			return false;
		}
		
		/*
		if(checkLength(itemId, 1)){
			alert('�A�C�e����/�ԍ��ɑS�p�����͋��e����Ă��܂���B');
			return false;
		}
		
		
		if(checkIncludeHalfKana(itemId)){
			alert('�A�C�e����/�ԍ��ɔ��p�J�i�͋��e����Ă��܂���B');
			return false;
		}
		*/
		
		if(itemId.indexOf('--') >= 0){
			alert("itemid��'--'�͋��e����Ă��܂���B");
			return false;
		}
		
		//�A�C�e���̌������s
		var itemSearchResultSet = search.create({
			type: search.Type.ITEM,	//�A�C�e��
			columns: [{							//�擾�Ώۍ���
				name: 'itemid'					//�A�C�e��ID
			},{
				name: 'internalid'	//����ID
			}],
			filters: [							//AND�ɂ��擾����(�t�B���^�[)
				{	name: 'itemid',				//�A�C�e��ID
					operator: search.Operator.IS,
					values: [itemId]
				}
			]
		})
		.run();
		
		var dupItemIds = [];
		
		//�������s���ʂ����[�v
		itemSearchResultSet.each(
			function(result){
				var tempInternalId = ''+result.getValue(itemSearchResultSet.columns[1]);	//����ID
				var tempItemId = result.getValue(itemSearchResultSet.columns[0]);	//�A�C�e��ID
				if(!isEmpty(tempInternalId) && tempInternalId != internalId){
					//����ID����łȂ������ꍇ���������g�ł͂Ȃ��ꍇ
					
					//�d���A�C�e���̔z��֊i�[
					dupItemIds.push(tempInternalId);
				}
				
				return true;
			}
		);
		
		if(dupItemIds.length != 0){
			alert('�A�C�e����/�ԍ������̃A�C�e���Əd�����Ă��܂��B�d���A�C�e���̓���ID�F' + dupItemIds);
			return false;
		}
		
		return true;
	}
	function isHanEisu(str){
		str = (str==null)?"":str;
		if(str.match(/^[A-Za-z_0-9\-]*$/)){
			return true;
		}else{
			return false;
		}
	}
	/****************************************************************
	* �S�p/���p��������
	*
	* ���� �F str �`�F�b�N���镶����
	* flg 0:���p�����A1:�S�p����
	* �߂�l�F true:�܂܂�Ă���Afalse:�܂܂�Ă��Ȃ� 
	*
	****************************************************************/
	function checkLength(str,flg) {
		for (var i = 0; i < str.length; i++) {
			var c = str.charCodeAt(i);
			// Shift_JIS: 0x0 ~ 0x80, 0xa0 , 0xa1 ~ 0xdf , 0xfd ~ 0xff
			// Unicode : 0x0 ~ 0x80, 0xf8f0, 0xff61 ~ 0xff9f, 0xf8f1 ~ 0xf8f3
			if( (c >= 0x0 && c < 0x81) || (c == 0xf8f0) || (c >= 0xff61 && c < 0xffa0) || (c >= 0xf8f1 && c < 0xf8f4)) {
				if(!flg) return true;
			}else{
				if(flg) return true;
			}
		}
		return false;
	}
	
	function checkIncludeHalfKana(str) {
		for (var i = 0; i < str.length; i++) {
			if(isHankakuKana(str[i])){
				return true;
			}
		}
		return false;
	}
	
	function isHankakuKana(s) {
		return !!s.match(/^[�-�]*$/);
	}
	
	//��l����
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
	}
	
	return {
		pageInit: pageInit,
		saveRecord: saveRecord
	};
});