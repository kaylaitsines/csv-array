module.exports = {

  lineNumber: 1,

  parseCSV : function(fileName, callBack, considerFirstRowAsHeading) {
    if(typeof considerFirstRowAsHeading == "undefined") {
      considerFirstRowAsHeading = true;
    }
    var presentInstance = this;
    var fs = require('fs');
    fs.exists(fileName, function(exists) {
      if(exists) {
        presentInstance.parseFile(fileName, callBack, considerFirstRowAsHeading);
      } else {
        console.log("The provided file " + fileName + " doesn't exists or inaccessible");
      }
    });
  },

  // returns data from a single line
  getDataFromLine : function(line) {
    this.lineNumber++;
    var dataArray = [];
    var tempString = "";
    var lineLength = line.length;
    var index=0;
    try {
      while(index<lineLength) {
        if(line[index]=='"') {
          var index2 = index+1;
          while(line[index2]!='"') {
            tempString+=line[index2];
            index2++;
          }
          dataArray.push(tempString);
          tempString = "";
          index = index2+2;
          continue;
        }
        if(line[index]!=",") {
          tempString += line[index];
          index++; continue;
        }
        if(line[index]==",") {
          dataArray.push(tempString);
          tempString = "";
          index++;continue;
        }

      }
      dataArray.push(tempString);
      return dataArray;
    } catch(e) {
      console.log('\x1B[31mERROR LINE ' + this.lineNumber + '\x1B[39m', line);
      console.log('\x1B[31mPlease replace " with &quot; and delete all new/blank lines\x1B[39m');
    };
  },

  parseFile : function(fileName, callBack, considerFirstRowAsHeading) {
    var presentObject = module.exports;
    var lblReader = require('line-by-line');
    var readStream = new lblReader(fileName);

    var tempDataArray = [];
    var tempAttributeNameArray = [];
    var tempLineCounter = 0;

    readStream.on('error', function(){
      console.log("cannot read the file any more.");
    });

    readStream.on('line', function(line) {
      readStream.pause();

      setTimeout(function() {
        if(tempLineCounter == 0) {
          tempAttributeNameArray = line.split(",");
          if(!considerFirstRowAsHeading) {
            if(tempAttributeNameArray.length == 1) {
              tempDataArray.push(line);
            } else {
              tempDataArray.push(tempAttributeNameArray);
            }
          }
          tempLineCounter = 1;
        } else {
          tempDataArray.push(presentObject.buildOutputData(tempAttributeNameArray, line, considerFirstRowAsHeading));

        };

        readStream.resume();
      }, 0);
    });

    readStream.on('end', function() {
      if(tempDataArray.length == 0) {
        tempDataArray = tempAttributeNameArray;
      }
      callBack(tempDataArray);
    });
  },

  buildOutputData : function(tempAttributeNameArray, line, considerFirstRowAsHeading) {
    var presentObject = module.exports;
    var dataArray = presentObject.getDataFromLine(line);
    if(!considerFirstRowAsHeading) {
      if(tempAttributeNameArray.length == 1) {
        return dataArray[0];
      } else {
        return dataArray;
      }
    } else {
      var tempObject = {};
      var tempAttributeNameArrayLength = tempAttributeNameArray.length;
      for(var index=0; index<tempAttributeNameArrayLength; index++) {
        tempObject[tempAttributeNameArray[index]] = ((typeof dataArray[index]!="undefined")?dataArray[index]:"");
      }
      return tempObject;
    }
  }

}
