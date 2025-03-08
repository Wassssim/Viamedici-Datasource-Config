//ORACLE or MSSQL 
//export var DBMS = "ORACLE";
export var DBMS = "MSSQL";

export const Oracle_DB = {  server:     "192.168.150.20",
                            user:       "DEV01",
                            password:   "DEV01"};

//MSSQL 2017 DB von team Phönix for developoment                             
/*export const MSSQL_DB =   { server:     "192.168.150.64",
                            database:   "TEAM01",
                            user:       "team01",
                            password:   "team01"};*/

//MSSQL 2019 DB from CI                             
//  export const MSSQL_DB =   { server:     "192.168.1.244\\MSSQLSERVER2019",
//                              database:   "Komsa",
//                             user:       "Komsa",
//                             password:   "Komsa"};



/*export const viaResourcesPath = {
    Windows: "D:/EPIMHOME/viaMEDICI/WEB-INF/classes/resources/",
    Linux: "/opt/viamedici/EPIMHOME/viaMEDICI/WEB-INF/classes/resources/",
    Local: "./server/viaResources/"
}; */

export const MSSQL_DB =   { server:     "192.168.150.210",
                            database:   "Knauf_TEST",
                            user:       "knauf-test",
                            password:   "knauf-test"};

export const datastoreDB = "http://localhost:9200/"


export const dataStoreIndexPrefix = "knauf";
export const viaResourcesPropertiesFilesShortcut = "KNDE";
export const attributeUniqueIdSuffix = "-8FXC-TEST";

export const expectedDurationProcessingProductAttributesInSeconds = 1.7;
export const expectedDurationProcessingVariantAttributesInSeconds = 1.9;
export const durationDataQueryAttributesTooLongInSesonds = 240;
export const durationProcessingTimeForAttributesCount = 10000;
export const attributeScrollsize = 10000;



export const viaResourcesPath = {
    Windows: "D:/EPIMHOME/viaMEDICI/WEB-INF/classes/resources/",
    Linux: "/opt/viamedici/EPIMHOME/viaMEDICI/WEB-INF/classes/resources/",
    Local: "./server/viaResources/"
}; 

export const applikationUser = "$2b$10$L30JjnKbbj5sJPOE82RH1.Iq.mYfCJmLNTAi9CUSmwRat3yWsr2oG";
export const applikationPassword = "$2b$10$n9HW4DxvpPhVZIAPHAkXY.slUANMxbF1YXy2wYWaCmK.WJFnyuAPS";