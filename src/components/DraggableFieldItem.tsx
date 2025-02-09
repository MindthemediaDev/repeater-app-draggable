import React, { useRef } from 'react';

import {
    EditorToolbarButton,
    TextField,
    Grid,
    Icon
} from '@contentful/forma-36-react-components';

import type { Identifier, XYCoord } from 'dnd-core'
import { useDrag, useDrop } from "react-dnd";

interface Item {
    index: number;
    id: string;
    key: string;
    value: string;
}

interface DraggableFieldItemProps {
    id: any;
    index: number;
    item: Item;
    valueName: any;
    createOnChangeHandler: Function;
    deleteItem: Function;
    moveDraggableItem: Function;
}


const DraggableFieldItem = (props: DraggableFieldItemProps) => {

    // useDrag - the list item is draggable
    const [{ isDragging }, dragRef] = useDrag({
        type: 'DraggableFieldItem',
        item: { id: props.id, index: props.index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    })

    // useDrop - the list item is also a drop area
    // eslint-disable-next-line
    const [{ handlerId }, dropRef] = useDrop<
        Item,
        void,
        { handlerId: Identifier | null }
    >({
        accept: 'DraggableFieldItem',
        collect(monitor) {
            return {
              handlerId: monitor.getHandlerId(),
            }
        },
        hover: (item: Item, monitor) => {
            if (!ref.current) {
                return
            }
            
            const dragIndex = item.index;
            const hoverIndex = props.index;

            if (dragIndex === hoverIndex) {
                return
            }

            // Determine rectangle on screen
            const hoverBoundingRect = ref.current?.getBoundingClientRect()

            // Get vertical middle
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

            // Determine mouse position
            const clientOffset = monitor.getClientOffset()

            // Get pixels to the top
            const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top

            // Only perform the move when the mouse has crossed half of the items height
            // When dragging downwards, only move when the cursor is below 50%
            // When dragging upwards, only move when the cursor is above 50%

            // Dragging downwards
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                return
            }

            // Dragging upwards
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                return
            }
            props.moveDraggableItem(dragIndex, hoverIndex)
            item.index = hoverIndex
        },
    })

    // Join the 2 refs together into one (both draggable and can be dropped on)
    const ref = useRef<HTMLDivElement>(null)
    const dragDropRef = dragRef(dropRef(ref)) as React.LegacyRef<HTMLDivElement>;

    // Make items being dragged transparent, so it's easier to see where we drop them
    const opacity = isDragging ? 0.3 : 1

    return(
        <div key={props.item.id} style={{ opacity }} ref={dragDropRef} data-handler-id={handlerId}>
            <Grid columns={'auto 1fr 1fr auto'}>
                <div style={{cursor: 'grab', paddingTop: 7}} >
                    <Icon color="muted" size="small" icon="Drag" />
                </div>
                <div draggable={true} onDragStart={event => event.preventDefault()}>
                    <TextField
                        id="key"
                        name="key"
                        labelText={"Item Name"}
                        value={props.item.key}
                        onChange={props.createOnChangeHandler(props.item, 'key')}
                    />
                </div>
                <div draggable={true} onDragStart={event => event.preventDefault()}>
                    <TextField
                        id="value"
                        name="value"
                        labelText={props.valueName}
                        value={props.item.value}
                        onChange={props.createOnChangeHandler(props.item, 'value')}
                    />
                </div>
                <EditorToolbarButton
                    label="delete"
                    icon="Delete"
                    onClick={() => props.deleteItem(props.item)}
                />
            </Grid>
        </div> 
    )
} 

export default DraggableFieldItem;
