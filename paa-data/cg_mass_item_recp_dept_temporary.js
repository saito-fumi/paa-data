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


		//var newDept = 590; //新部門：カルチャー推進
		// var newDept2 = 1878; //新部門：EC運営
		// var newDept3 = 167; //新部門：オンライン新規

		//the G/L impact of a voided transaction cannot be changed、
		if (rec.getValue('voided') == 'F') {

			var oldDept = rec.getValue({
					fieldId: 'department'
				});

			if(oldDept == 460){ //広報

				rec.setValue({
					fieldId: 'department',
					value: 590 //カルチャー
				});

			}else if(oldDept == 457){ //ECモール

				rec.setValue({
					fieldId: 'department',
					value: 1878 //ECモール運営
				});

			}else if(oldDept == 353){ //CX

				rec.setValue({
					fieldId: 'department',
					value: 354 //CRM
				});

			}else if(oldDept == 166){ //MK2

				rec.setValue({
					fieldId: 'department',
					value: 167 //オンライン新規
				});

			}else if(oldDept == 253){ //リテ本部

				rec.setValue({
					fieldId: 'department',
					value: 464 //プロセスマネジメント
				});

			}else if(oldDept == 364){ //Asean

				rec.setValue({
					fieldId: 'department',
					value: 182 //アジアパシフィック事業部
				});

			}else if(oldDept == 363){ //Greater

				rec.setValue({
					fieldId: 'department',
					value: 571 //中国事業部
				});

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