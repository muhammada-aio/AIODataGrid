import { createElement, useState, useEffect, useRef } from "react";
import * as PapaParse from "papaparse";
import _ from "lodash";
import { CSVLink } from 'react-csv'
import moment from "moment";
import { GridComponent, ColumnsDirective, ColumnDirective, Page, Toolbar, Inject, Resize } from '@syncfusion/ej2-react-grids';
import "./Grid.css";

const DataGrid = ({ csv, headerMeta, reportId }) => {
    const [data, setData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [formattedCSVData, setFormattedCSVData] = useState("");
    const csvLink = useRef();

    useEffect(() => {
        if (csv.status === "available" && csv.value !== "" && headerMeta.status === "available" && headerMeta.value !== "") {
            const parsedFile = PapaParse.parse(csv.value.trim(), {
                delimiter: ',',
                escapeChar: '\\',
                header: true,
                quoteChar: '"',
                newLine: '\r\n',
                error: (err) => {
                    console.error("Error while parsing CSV:", err);
                }
            })
            let columnsMeta = []
            try {
                columnsMeta = JSON.parse(headerMeta.value).filter((el) => parsedFile.meta.fields.includes(el.attributeName));
            } catch (error) {
                columnsMeta = parsedFile.meta.fields.map(field => ({
                    "attributeName": field,
                    "displayName": field.replace(/([A-Z][a-z])/g, ' $1').replace(/(\d)/g, ' $1'),
                    "dataType": "String",
                    "order": 0
                }))
                console.error(error)
            }

            setData([]);
            setColumns([])
            setTimeout(() => {
                setColumns(columnsMeta)
                setData(parsedFile.data)
            }, 10)
        }
    }, [csv, headerMeta])


    const toolbarOptions = [{ text: 'Search', align: 'Right' }, { text: 'Download', align: 'Left', id: "download", prefixIcon: 'e-download', }];

    const formatColumn = (props, dataType) => {
        if (dataType === "Date" || dataType === "DateTime") {
            return moment.unix(props[props.column.field] / 1000).format("MM/DD/YYYY")
        }
        else if (dataType === "Boolean") {
            return !!props[props.column.field] ? "Yes" : "No";
        }
        else if (dataType === "Integer") {
            return Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(props[props.column.field])
        } else if (dataType === "Decimal") {
            return Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(props[props.column.field])
        } else if (dataType === "Currency") {
            return Intl.NumberFormat('en-US', { style: "currency", currency: 'USD', maximumFractionDigits: 2 }).format(props[props.column.field])
        } else if (dataType === "Percentage") {
            return Intl.NumberFormat('en-US', { style: "percent", maximumFractionDigits: 2 }).format(props[props.column.field])
        }
        return props[props.column.field]
    }

    const clickHandler = (args) => {
        if (args.item.id === 'download') {
            const formatted = data.map(x => {
                const keys = Object.keys(x);
                let newObject = {};
                keys.forEach(y => {
                  newObject[y.replace(/([A-Z][a-z])/g, ' $1').replace(/(\d)/g, ' $1').trim()] = x[y]
                });
                return newObject;
              })
            const csvFileContent = PapaParse.unparse(formatted);
            setFormattedCSVData(csvFileContent);
            setTimeout(() => {
                csvLink.current.link.click()
            }, 300)
        }
    };

    return <div className='control-pane'>
        <div className='control-section row'>
            {data.length > 0 && (
                <GridComponent
                    width="100%"
                    dataSource={data}
                    allowPaging={true}
                    toolbar={toolbarOptions}
                    toolbarClick={clickHandler}
                    allowResizing={true}
                    locale='en-US' 
                    pageSettings={{ pageCount: Math.ceil(data.length / 10), pageSizes: true  }}
                >
                    <ColumnsDirective>
                        {_.orderBy(columns, "order").map((column) => {
                            return (
                                <ColumnDirective
                                    field={column.attributeName}
                                    headerText={column.displayName}
                                    width={column.displayName.length * 10}
                                    template={(props) => formatColumn(props, column.dataType)}
                                ></ColumnDirective>
                            );
                        })}
                    </ColumnsDirective>
                    <Inject services={[Page, Toolbar, Resize]} />
                </GridComponent>
            )}
        </div>
        <CSVLink
         data={formattedCSVData}
         filename={`Export${reportId.value}.csv`}
         className='hidden'
         ref={csvLink}
         target='_blank'
      />
    </div>;
}

export default DataGrid