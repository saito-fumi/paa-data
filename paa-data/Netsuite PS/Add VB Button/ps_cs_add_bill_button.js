/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 * @author Keito Imai
 */
 /**
 * Module Description
 *
 * Version	Date					Author			Remarks
 * 1.00		2021/12/17				Keito Imai		Initial Version
 * 
 */

define(['N/ui/message',
		'N/ui/dialog',
		'N/runtime',
		'N/record',
		'N/search',
		'N/url',
		'./moment'],
function(message, dialog, runtime, record, search, url, moment){
	function pageInit(context){
	}
	function postSourcing(context){
	}
	function fieldChanged(context){
	}
	function saveRecord(context){
		return true;
	}
	function lineInit(context){
	}

	////////////////////
	//Add custom functions
	
	function createVB(irId, poId){
		console.log('irId:' + irId);
		console.log('poId:' + poId);
		const domain = url.resolveDomain({hostType: url.HostType.APPLICATION});
		const urlStr = 'https://' + domain;
		const toUrl = urlStr + '/app/accounting/transactions/vendbill.nl?transform=purchord&itemrcpt=' + irId +'&id=' + poId + '&e=T&memdoc=0';
		location.href = toUrl;
		
		return null;
	}
	
	
	
	//���t�� yyyy/MM/dd �`���ɕϊ����ĕԋp
	function date2strYYYYMMDD(d){
		return d.getFullYear() + '/' + (('00' + (d.getMonth() + 1)).slice(-2)) + '/' + ('00' + d.getDate()).slice(-2);
	}
	
	//���t�� yyyy/M/d �`���ɕϊ����ĕԋp
	function date2strYYYYMD(d){
		return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
	}
	
	//���t�� yyyyMMdd �`���̐��l�֕ϊ����ĕԋp
	function date2strYYYYMMDDNum(d){
		d = new Date(d.getTime() + 9 * 60 * 60 * 1000);
		return (d.getFullYear() + (('00' + (d.getMonth() + 1)).slice(-2)) + ('00' + d.getDate()).slice(-2)) * 1;
	}
	
	return {
		pageInit: pageInit,
		//lineInit: lineInit,
		//fieldChanged: fieldChanged,
		//postSourcing: postSourcing,
		//saveRecord: saveRecord,
		createVB: createVB
	};
});
