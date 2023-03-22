import { createElement, useState, useEffect } from "react";
import * as PapaParse from "papaparse";
import moment from "moment";
import { GridComponent, ColumnsDirective, ColumnDirective, Page, Toolbar, Inject, Resize } from '@syncfusion/ej2-react-grids';
import "./Grid.css";

const DataGrid = ({ csv }) => {
    const [data, setData] = useState([]);
    const [columns, setColumns] = useState([]);

    useEffect(() => {
        if (csv.status === "available" && csv.value !== "") {
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
            setColumns(parsedFile.meta.fields)
            setData(parsedFile.data)
        }
    }, [csv])


    const toolbarOptions = ['Search'];

    const formatColumn = (props) => {
        if (props.column.field.toLowerCase().includes("date")) {
            return moment.unix(props[props.column.field] / 1000).format("MM/DD/YYYY")
        } else if (!isNaN(props[props.column.field])) {
            return Intl.NumberFormat('en-US').format(props[props.column.field])
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
                            const headerText = column
                                .replace(/([A-Z][a-z])/g, ' $1')
                                .replace(/(\d)/g, ' $1');

                            return (
                                <ColumnDirective
                                    field={column}
                                    headerText={headerText}
                                    width={headerText.length * 10}
                                    template={formatColumn}
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