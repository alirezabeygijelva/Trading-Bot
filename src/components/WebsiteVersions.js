import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Button } from 'primereact/button';
import { classNames } from 'primereact/utils';
import { InputText } from 'primereact/inputtext';
import { ContextMenu } from 'primereact/contextmenu';
import { Dialog } from 'primereact/dialog';
import { contentHelper } from '../utils/ContentHelper';
import { useFormik } from 'formik';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { scalpServices } from '../services/ScalpServices';
import { columnHelper } from '../utils/ColumnHelper';
import Export from '../components/Export';
import Paginator from '../components/Paginator';
import ColumnManager from '../components/ColumnManager';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Tooltip } from 'primereact/tooltip';
import '../assets/scss/WebsiteVersions.scss';

const WebsiteVersions = () => {
    const pg = React.useRef(null);
    const dt = React.useRef(null);
    const cm = React.useRef(null);

    const [globalFilter, setGlobalFilter]= React.useState('');
    const [selectedContent, setSelectedContent]= React.useState(null);
    const [websiteVersions, setWebsiteVersions]= React.useState([]);
    const [loading, setLoading]= React.useState(true);
    const [direction, setDirection]= React.useState('ltr');
    const [displayUpdateDialog, setDisplayUpdateDialog]= React.useState(false);
    const [displayCreateDialog, setDisplayCreateDialog]= React.useState(false);
    const [displayDialog, setDisplayDialog]= React.useState(false);
    const [deleteId, setDeleteId]= React.useState('');
    const [first, setFirst]= React.useState(0);
    const [rows, setRows]= React.useState(10);

    const menuModel = [
        {
            label: 'Copy Content',
            icon: 'pi pi-fw pi-cpoy',
            command: () => contentHelper.copy(selectedContent.originalEvent?.target?.innerText)
        },
        {
            label: 'Copy Data',
            icon: 'pi pi-fw pi-cpoy',
            command: () => contentHelper.copy(selectedContent.value[selectedContent.originalEvent.target.classList[0]])
        },
    ];

    React.useEffect(() => {
        loadData();
    }, [rows]);// eslint-disable-line react-hooks/exhaustive-deps

    const loadData = async () => {
        setLoading(true);

        scalpServices.getAllWebsiteVersions().then(data => {
            setWebsiteVersions(data ?? {});
            setLoading(false);
        });
    }

    const actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <Button tooltip="Update" type="button" onClick={() => onUpdate(rowData)}
                    icon="pi pi-pencil" className='my-2 p-button-rounded p-button-outlined p-button-success'></Button>
                <Button icon="pi pi-trash" tooltip="Delete" className="my-2 p-button-rounded p-button-outlined p-button-danger" onClick={() => deleteItem(rowData.id)} />
            </React.Fragment>
        );
    }

    const deleteItem = (id) => {
        setDeleteId(id);
        setDisplayDialog(true);
    }

    const acceptDelete = () => {
        setLoading(true);
        scalpServices.deleteWebsiteVersion(deleteId).then((response) => {
            if (Array.isArray(response)) {
                toast.current.show(response.map(x => ({
                    severity: 'error',
                    detail: `${x}`,
                    life: 5000
                })));
                setLoading(false);
            } else {
                toast.current.show({
                    severity: 'success',
                    detail: "Opration Successfully",
                    life: 4000
                });
                loadData();
            }
        });
    }

    const changelogBodyTemplate = (rowData) => {
        if (rowData?.changelogStr && rowData.changelogStr.length > 50) {
            return <p title={rowData.changelogStr.replaceAll('|', '\n')}>
                {rowData.changelogStr.substr(0, 60).replaceAll('|', ', ')}...</p>
        }
        return (rowData.changelogStr ? <p>{rowData.changelogStr.replaceAll('|', ', ')}</p> : "");
    }

    const reset = () => {
        setGlobalFilter('');
        dt.current.reset();
    }

    const dialogFuncMap = {
        'displayUpdateDialog': setDisplayUpdateDialog,
        'displayCreateDialog': setDisplayCreateDialog,
    }

    const showCreateDialog = () => {
        dialogFuncMap[`displayCreateDialog`](true);
    }

    const onHide = (name) => {
        dialogFuncMap[`${name}`](false);
    }

    const toast = React.useRef(null);
    const cFormik = useFormik({
        initialValues: {
            name: '',
            changelog: ''
        },
        validate: (data) => {
            let errors = {};

            if (!data.name) {
                errors.name = 'Name is required.';
            }

            return errors;
        },
        onSubmit: (data) => {
            setLoading(true);
            data.changelogStr = data.changelog;
            data.changelog = null;
            scalpServices.createWebsiteVersion(data)
                .then(response => {
                    if (response) {
                        if (Array.isArray(response)) {
                            toast.current.show(response.map(x => ({
                                severity: 'error',
                                detail: `${x}`,
                                life: 5000
                            })));
                            setLoading(false);
                        } else {
                            setLoading(false);
                            toast.current.show({
                                severity: 'success',
                                detail: `Created Successfully!`,
                                life: 5000
                            });
                            cFormik.resetForm();
                            onHide('displayCreateDialog');
                            loadData();
                        }
                    }
                });
        }
    });

    const uFormik = useFormik({
        initialValues: {
            id: '',
            name: '',
            changelog: ''
        },
        validate: (data) => {
            let errors = {};
            if (!data.name) {
                errors.name = 'Name is required.';
            }
            return errors;
        },
        onSubmit: (data) => {
            setLoading(true);
            data.changelogStr = data.changelog;
            data.changelog = null;
            scalpServices.updateWebsiteVersion(data)
                .then(response => {
                    if (response) {
                        if (Array.isArray(response)) {
                            toast.current.show(response.map(x => ({
                                severity: 'error',
                                detail: `${x}`,
                                life: 5000
                            })));
                            setLoading(false);
                        } else {
                            setLoading(false);
                            toast.current.show({
                                severity: 'success',
                                detail: `Updated successfully!`,
                                life: 5000
                            });
                            onHide('displayUpdateDialog');
                            loadData();
                        }
                    }
                });
        }
    });


    const onUpdate = (rowData) => {
        scalpServices.getWebsiteVersion(rowData.id).then((data) => {
            if (Array.isArray(data)) {
                toast.current.show(data.map(x => ({
                    severity: 'error',
                    detail: `${x}`,
                    life: 5000
                })));
            }
            else {
                uFormik.setValues({
                    id: data.id,
                    name: data.name,
                    changelog: data.changelogStr,
                })
                dialogFuncMap[`displayUpdateDialog`](true);
            }
        });
    }

    const isFormFieldValid = (name) => !!(uFormik.touched[name] && uFormik.errors[name]);
    const getFormErrorMessage = (name) => {
        return isFormFieldValid(name) && <small className="p-error">{uFormik.errors[name]}</small>;
    };

    const iscFormFieldValid = (name) => !!(cFormik.touched[name] && cFormik.errors[name]);
    const getcFormErrorMessage = (name) => {
        return iscFormFieldValid(name) && <small className="p-error">{cFormik.errors[name]}</small>;
    };

    const columns = [
        {
            ...columnHelper.defaultColumn,
            columnKey: "rowNumber",
            bodyClassName: "text-center",
            style: { 'minWidth': '25px', width: '25px' },
            body: (col, context) => context.rowIndex + 1,
            header: "#"
        },
        {
            ...columnHelper.defaultColumn,
            field: "name",
            header: "Name",
            sortable: true,
            style: { 'minWidth': '50px', width: '150px' },
            bodyStyle: { justifyContent: 'center' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "changelogStr",
            header: "Changelog",
            sortable: true,
            body: changelogBodyTemplate,
            style: { 'minWidth': '50px', width: '150px' },
            bodyStyle: { justifyContent: 'center' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "versionDate",
            header: "Version Date",
            sortable: true,
            style: { 'minWidth': '50px', width: '150px' },
            bodyStyle: { justifyContent: 'center' }
        },
        {
            ...columnHelper.defaultColumn,
            columnKey: "actions",
            header: "Actions",
            body: actionBodyTemplate,
            style: { width: '8em' },
            bodyStyle: { justifyContent: 'center', overflow: 'visible' }
        },
    ]

    const header = (
        <div className="table-header-container flex-wrap align-items-center">
            <Button type="button" label="Create" className="p-button-outlined p-button-help mr-2" icon="pi pi-plus" onClick={showCreateDialog} />
            <Button type="button" icon="pi pi-file-excel" onClick={() => Export.exportExcel(websiteVersions, "website-versions")} className="p-button-info" tooltip="XLS" />
            <div className="filter-container">
                <Button type="button" label="Clear" className="p-button-outlined" icon="pi pi-filter-slash" onClick={reset} />
                <span className="flex p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText type="search" value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Global Search" />
                </span>
            </div>
            <ColumnManager columns={columns} dataTableName="dt-state-website-versions"
                onSave={() => setWebsiteVersions(prevState => [...prevState])} />
        </div>
    );

    React.useEffect(() => {
        if (contentHelper.isRTL(cFormik.values.changelog))
            setDirection("rtl");
        else
            setDirection("ltr")
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cFormik.values.changelog])

    React.useEffect(() => {
        if (contentHelper.isRTL(uFormik.values.changelog))
            setDirection("rtl");
        else
            setDirection("ltr")
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uFormik.values.changelog])

    return (
        <React.Fragment>
            <Toast ref={toast} />
            <div id="website-versions-container">
                <ConfirmDialog visible={displayDialog} onHide={() => setDisplayDialog(false)} message="Are you sure you want to Delete it?"
                    header="Confirmation" icon="pi pi-exclamation-triangle" accept={acceptDelete} reject={() => setDisplayDialog(false)} />
                <Dialog id="create-dialog" header="Create New" maximizable visible={displayCreateDialog} onHide={() => onHide('displayCreateDialog')} breakpoints={{ '960px': '75vw', '640px': '100vw' }} style={{ width: '50vw' }}>
                    <div className="flex justify-content-center mt-4">
                        <Card className='card' style={{ width: '100%' }}>
                            <form onSubmit={cFormik.handleSubmit} className="p-fluid">
                                <div className="p-field">
                                    <span className="p-float-label">
                                        <InputText id="name" name="name" value={cFormik.values.name} onChange={cFormik.handleChange}
                                            autoFocus className={classNames({ 'p-invalid': iscFormFieldValid('name') })} />
                                        <label htmlFor="name" className={classNames({ 'p-error': iscFormFieldValid('name') })}>Name *</label>
                                    </span>
                                    {getcFormErrorMessage('Name')}
                                </div>
                                <div className="p-field">
                                    <span className="p-float-label">
                                        <InputTextarea id="changelog" name="changelog" value={cFormik.values.changelog} rows={5} cols={60} autoFocus autoResize
                                            onChange={cFormik.handleChange} style={{ direction: direction }} className={classNames({ 'p-invalid': iscFormFieldValid('changelog') })} />
                                        <label htmlFor="changelog" className={classNames({ 'p-error': iscFormFieldValid('changelog') })}>Changelog</label>
                                    </span>
                                    {getcFormErrorMessage('changelog')}
                                </div>
                                <div className="text-center">
                                    <Button label="Save" type="submit" className='p-button-raised p-button-success' loading={loading} />
                                </div>
                            </form>
                        </Card>
                    </div>
                </Dialog>
                <Dialog id="update-dialog" header="Update" maximizable visible={displayUpdateDialog} onHide={() => onHide('displayUpdateDialog')} breakpoints={{ '960px': '75vw', '640px': '100vw' }} style={{ width: '50vw' }}>
                    <div className="flex justify-content-center mt-4">
                        <Card className='card' style={{ width: '100%' }}>
                            <form onSubmit={uFormik.handleSubmit} className="p-fluid">
                                <input type="hidden" value={uFormik.values.id} ></input>
                                <div className="p-field">
                                    <span className="p-float-label">
                                        <InputText id="name" name="name" value={uFormik.values.name} onChange={uFormik.handleChange}
                                            autoFocus className={classNames({ 'p-invalid': isFormFieldValid('name') })} />
                                        <label htmlFor="name" className={classNames({ 'p-error': isFormFieldValid('name') })}>Name *</label>
                                    </span>
                                    {getFormErrorMessage('Name')}
                                </div>
                                <div className="p-field">
                                    <span className="p-float-label">
                                        <InputTextarea id="changelog" name="changelog" value={uFormik.values.changelog} rows={5} cols={60} autoFocus autoResize
                                            onChange={uFormik.handleChange} style={{ direction: direction }} className={classNames({ 'p-invalid': isFormFieldValid('changelog') })} />
                                        <label htmlFor="changelog" className={classNames({ 'p-error': isFormFieldValid('changelog') })}>Changelog</label>
                                    </span>
                                    {getFormErrorMessage('changelog')}
                                </div>
                                <div className="text-center">
                                    <Button label="Save" type="submit" className='p-button-raised p-button-success' loading={loading} />
                                </div>
                            </form>
                        </Card>
                    </div>
                </Dialog>
                <ContextMenu model={menuModel} ref={cm} onHide={() => setSelectedContent(null)} />
                <div className="card">
                    <Paginator ref={pg} setFirst={setFirst} setRows={setRows} />
                    <Tooltip target=".tltip" mouseTrack mouseTrackLeft={50} />
                    <DataTable ref={dt} value={websiteVersions} className={"p-datatable-sm"} showGridlines filterDisplay="row" scrollDirection="both"
                        loading={loading} paginator globalFilter={globalFilter} scrollable header={header}
                        paginatorTemplate={pg.current?.paginatorTemplate} first={first} rows={rows} onPage={pg.current?.onPage}
                        contextMenuSelection={selectedContent} sortMode="multiple"
                        onContextMenuSelectionChange={e => setSelectedContent(e)}
                        cellClassName={(data, options) => options.field}
                        onContextMenu={e => cm.current.show(e.originalEvent)}>

                        {columnHelper.generatColumns(columns, "dt-state-website-versions")}

                    </DataTable>
                </div>
            </div>
        </React.Fragment>
    );
}

export default WebsiteVersions;

