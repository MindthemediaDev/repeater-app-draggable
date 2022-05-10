import React, { JSXElementConstructor, ReactElement, useEffect, useRef } from 'react';

import {
    EditorToolbarButton,
    TableRow,
    TableCell,
    TextField,
} from '@contentful/forma-36-react-components';

import { DragLayerMonitor, DropTargetMonitor, useDrag, useDrop } from "react-dnd";

interface Item {
    index: number;
    id: string;
    key: string;
    value: string;
}

interface DraggableFieldItemProps {
    index: number;
    item: Item;
    valueName: any;
    createOnChangeHandler: Function;
    deleteItem: Function;
    moveDraggableItem: Function;
}

/*<TableCell align="left">
    <EditorToolbarButton
        label="delete"
        icon="ChevronUp"
        onClick={() => moveItemUp(props.item)}
    />
    <EditorToolbarButton
        label="delete"
        icon="ChevronDown"
        onClick={() => moveItemDown(props.item)}
    />
</TableCell>*/

const DraggableFieldItem = (props: DraggableFieldItemProps) => {


    // useDrag - the list item is draggable
    const [{ isDragging }, dragRef] = useDrag({
        type: 'item',
        item: { index: String },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    })


    // useDrop - the list item is also a drop area
    const [spec, dropRef] = useDrop({
        accept: 'item',
        hover: (item: Item, monitor: any) => {
            const dragIndex = item.index;
            const hoverIndex = props.index;
            const hoverBoundingRect = ref.current?.getBoundingClientRect()
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
            const hoverActualY = monitor.getClientOffset().y - hoverBoundingRect.top

            // if dragging down, continue only when hover is smaller than middle Y
            if (dragIndex < hoverIndex && hoverActualY < hoverMiddleY) return
            // if dragging up, continue only when hover is bigger than middle Y
            if (dragIndex > hoverIndex && hoverActualY > hoverMiddleY) return

            props.moveDraggableItem(dragIndex, hoverIndex)
            item.index = hoverIndex
        },
    })

    // Join the 2 refs together into one (both draggable and can be dropped on)
    const ref = useRef<any>(null)
    const dragDropRef = dragRef(dropRef(ref)) as React.LegacyRef<HTMLTableRowElement>;

    // Make items being dragged transparent, so it's easier to see where we drop them
    const opacity = isDragging ? 0 : 1




    return(
        <TableRow key={props.item.id} ref={dragDropRef} style={{ opacity }}>
            <TableCell>
                <TextField
                    id="key"
                    name="key"
                    labelText="Item Name"
                    value={props.item.key}
                    onChange={props.createOnChangeHandler(props.item, 'key')}
                />
            </TableCell>
            <TableCell>
                <TextField
                    id="value"
                    name="value"
                    labelText={props.valueName}
                    value={props.item.value}
                    onChange={props.createOnChangeHandler(props.item, 'value')}
                />
            </TableCell>
            <TableCell align="right">
                <EditorToolbarButton
                    label="delete"
                    icon="Delete"
                    onClick={() => props.deleteItem(props.item)}
                />
            </TableCell>
        </TableRow>     
    )
} 

export default DraggableFieldItem;
