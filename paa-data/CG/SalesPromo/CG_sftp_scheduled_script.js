/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 */
define(["N/log", "N/search", "N/file", "N/sftp", "N/runtime"], function (
  log,
  search,
  file,
  sftp,
  runtime
) {
  function main() {

    var saved_search = search.load({id: 'customsearch_cg_sps_item_list'}).run();
    var file_name = timestamp("file");

    // Get the column names and put it to the csv files
    var contents_columns = saved_search.columns[0].label;
    for (var i = 1; i <= saved_search.columns.length - 1; i++) {
      contents_columns = contents_columns.concat(
        ",",
        saved_search.columns[i].label
      );
    }

    contents_columns = contents_columns + "\n";

    // Initiate the csv file
    var csvFile = file.create({
      name: file_name,
      contents: contents_columns,
      fileType: "CSV",
    });

    var ctr = 0;
    saved_search.each(function (result) {
      ctr += 1;
      var value_result = result.getValue(result.columns[0]);
      value_result = value_result.concat(",", result.getValue(result.columns[1]));
      value_result = value_result.concat(",", result.getText(result.columns[2]));
      value_result = value_result.concat(",", result.getText(result.columns[3]));
      log.debug("line = " + value_result);
      csvFile.appendLine({
        value: value_result,
      });
      return true;
    });
    log.debug(" NEW ITEMS INSERTED");

    csvFile.encoding = file.Encoding.UTF_8;
    log.debug("FILE ENCODING COMPLETED");

    var user_name = runtime
      .getCurrentScript()
      .getParameter("custscript_cg_sps_sftp_username");
    var password_guid = runtime
      .getCurrentScript()
      .getParameter("custscript_cg_sps_key_file");
    var host = runtime
      .getCurrentScript()
      .getParameter("custscript_cg_sps_host")
      .split(":");
    var directory = runtime
      .getCurrentScript()
      .getParameter("custscript_cg_sps_file_directory");
     try {
      var connection = sftp.createConnection({
        username: user_name,
        keyId: password_guid,
        url: host[0],
        port: parseInt(host[1]),
        directory: directory,
        hostKey:
        "AAAAB3NzaC1yc2EAAAADAQABAAABgQDt+Zo6GSXqi+yIpwC0ruBnAvys1tdld8i2ope0WHjpTZJYd+wQfslEEoWUhXbY2N/zKV+vyVNv2zoYTu6G8awWMqVdIqrDusOE1cVAbvF8lspxRTZ+ml8qnhEJ763DGUe+tUifa1uMI5rb0ybcqdXbfbWiD90d4KshUvYatTTwVtASYVgkPGiW08a0QCRBpa/l23HgoIKfz+cIB5BsEYL3Z4wQnooO8mu7pfcb4LXX3vUD66AtBnn/oSAHshOSLxIyS8SLAZWMBoY0b9FmUZTSRzJD80XcRXeS0+jZ3eS6ogW8V0jhwdkig3bJONFeRC8fJMH32RIzqV3O7QOde7j96sJloF2APumBp+R6HeqFU52NMky3KdwwL5U7DsE/taeABLUFVhVj2wesXzKAT0c7e3tqWSB+4wUv89VTyZutrahLFLv+44KfOsyeN+VEOmmW4/Z+mwi35f9zXS6CBgUjhtvUsjU+FNgF9fMcqGSugy9hkbHCHw6tDmla+YOlJz8=",
        hostKeyType: "rsa",
      });
      connection.upload({
        filename: file_name,
        file: csvFile,
        replaceExisting: true,
      });
      log.debug("SUCCESSFULLY UPLOADED TO SFTP SERVER");

      const regex_csv = /.+\.csv/;
      var listFiles = connection.list();

      for (var i = 0; i < listFiles.length; i++) {
        if (file_name != listFiles[i].name && listFiles[i].directory == false && regex_csv.test(listFiles[i].name) == true) {
          try {
            connection.removeFile({ path: listFiles[i].name });
            log.debug("DELETE OLD CSV FILE SUCCESS");
          } catch (err) {
            log.debug("DELETE ERROR");
          }
        }
      }
    } catch (err) {
      log.error({
        title: file_name,
        details: "SFTP SERVER ERROR:" + err,
      });
    }
  }
  function timestamp(prefix) {
    var date = new Date();
    var hours = add_zero(date.getHours());
    var minutes = add_zero(date.getMinutes());
    var seconds = add_zero(date.getSeconds());
    var today = add_zero(date.getDate());
    var month = add_zero(date.getMonth() + 1);
    var year = date.getFullYear();
    return (
      prefix +
      "_" +
      year +
      "_" +
      month +
      "_" +
      today +
      "_" +
      hours +
      "_" +
      minutes +
      "_" +
      seconds +
      ".csv"
    );
  }
  function add_zero(data) {
    return (data < 10 ? "0" : "") + data;
  }
  return {
    execute: main,
  };
  function generalSearch(recordType, queryParam, operator, dataColumns, filterColumn) {
    if (queryParam == undefined || queryParam == '')
      return null;
      try {
        var searchRecord = search.create({
          type: recordType,
          columns: dataColumns,
          filters: [filterColumn, operator, queryParam]
        }).run();

        return searchRecord.getRange({
          start: 0,
          end: 1
        });
     } catch (e) {
       log.debug(e.message);
       return null;
     }
   }
});