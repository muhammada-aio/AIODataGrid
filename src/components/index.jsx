import { createElement, useState, useEffect } from "react";
import * as PapaParse from "papaparse";
import moment from "moment";
import { GridComponent, ColumnsDirective, ColumnDirective, Page, Toolbar, Inject, Resize } from '@syncfusion/ej2-react-grids';
import "./Grid.css";

const DataGrid = ({ csv, headerMeta }) => {
    const [data, setData] = useState([]);
    const [columns, setColumns] = useState([]);

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


    const toolbarOptions = ['Search'];

    const formatColumn = (props, dataType) => {
        if(dataType === "DateTime") {
            return moment.unix(props[props.column.field] / 1000).format("MM/DD/YYYY")
        } 
        else if (dataType === "Integer") {
            return Intl.NumberFormat('en-US', {maximumFractionDigits: 0}).format(props[props.column.field])
        } else if(dataType === "Decimal") {
            return Intl.NumberFormat('en-US', {maximumFractionDigits: 2}).format(props[props.column.field])
        } else if(dataType === "Currency") {
            return Intl.NumberFormat('en-US', {style: "currency", maximumFractionDigits: 2}).format(props[props.column.field])
        }
        return props[props.column.field]
    }

    return <div className='control-pane'>
        <div className='control-section row'>
            {data.length > 0 && (
                <GridComponent
                    width="100%"
                    dataSource={data}
                    allowPaging={true}
                    toolbar={toolbarOptions}
                    allowResizing={true}
                    pageSettings={{ pageCount: Math.ceil(data.length / 10) }}
                >
                    <ColumnsDirective>
                        {columns.map((column) => {
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
    </div>;
}

export default DataGrid