/**
 * @NApiVersion 2.x
 * @NScriptType Portlet
 * @NModuleScope Public
 */
define(['N/url','N/runtime', 'N/ui/serverWidget'],

function(url, runtime, serverWidget) { 

	/**
	 * Definition of the Portlet script trigger point.
	 * 
	 * @param {Object} params
	 * @param {Portlet} params.portlet - The portlet object used for rendering
	 * @param {number} params.column - Specifies whether portlet is placed in left (1), center (2) or right (3) column of the dashboard
	 * @param {string} params.entity - (For custom portlets only) references the customer ID for the selected customer
	 * @Since 2015.2
	 */
	function render(params) { 
		var html = 	"������̃J�X�^���|�[�g���b�g���\������Ă���ƁA�y�[�W�̃��t���b�V�����Ƀ��}�C���_�������ɍX�V���܂��B<br />";
		html += 	"��\����Ԃ��Ɠ��삵�Ȃ����߁A��\���ɂ��Ȃ��ł��������B";
		html += 	"<script>";
		html += 	"	try{";
		html += 	"		console.log('Refresh Reminder START');";
		html += 	"		function refreshReminder(){";
		html +=		"			console.log('inFunction');";
		html += 	"			const dashboardChildren = parent.document.getElementsByClassName('ns-portlet-controls')[0].children;";
		html += 	"			for(var i = 0; i < dashboardChildren.length; i++){";
		html += 	"				if(dashboardChildren[i].title=='�X�V'){";
		html += 	"					dashboardChildren[i].click();";
		html += 	"				}";
		html += 	"			}";
		html += 	"		}";
		html += 	"		window.addEventListener('load', refreshReminder());";
		html += 	"		console.log('Refresh Reminder END');";
		html += 	"	}catch(e){";
		html += 	"	}";
		html += 	"</script>";
		
		var inlineHTMLField = params.portlet.addField({
			id: 'htmlfield',
			type: serverWidget.FieldType.INLINEHTML,
			label: '�@'
		});
		inlineHTMLField.defaultValue = html;
		
		params.portlet.title = 'Refresh Reminder';
		//params.portlet.html = html;
		
	}

	return {
		render: render
	};
	
});

