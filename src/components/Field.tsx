import React, { useEffect, useState } from 'react';
import {
    Button,
    Table,
    TableBody,
} from '@contentful/forma-36-react-components';
import tokens from '@contentful/forma-36-tokens';
import { FieldExtensionSDK } from '@contentful/app-sdk';
import { v4 as uuid } from 'uuid';



import DraggableFieldItem from "./DraggableFieldItem";

interface FieldProps {
    sdk: FieldExtensionSDK;
}

/** An Item which represents an list item of the repeater app */
interface Item {
    index: number;
    id: string;
    key: string;
    value: string;
}

/** A simple utility function to create a 'blank' item
 * @returns A blank `Item` with a uuid
*/
function createItem(): Item {
    return {
        index: 0,
        id: uuid(),
        key: '',
        value: '',
    };
}

/** The Field component is the Repeater App which shows up 
 * in the Contentful field.
 * 
 * The Field expects and uses a `Contentful JSON field`
 */
const Field = (props: FieldProps) => {
    const { valueName = 'Value' } = props.sdk.parameters.instance as any;
    const [items, setItems] = useState<Item[]>([]);

    useEffect(() => {
        // This ensures our app has enough space to render
        props.sdk.window.startAutoResizer();

        // Every time we change the value on the field, we update internal state
        props.sdk.field.onValueChanged((value: Item[]) => {
            if (Array.isArray(value)) {
                setItems(value);
            }
        });
    });

    /** Adds another item to the list */
    const addNewItem = () => {
        props.sdk.field.setValue([...items, createItem()]);
    };

    /** Creates an `onChange` handler for an item based on its `property`
     * @returns A function which takes an `onChange` event 
    */
    const createOnChangeHandler = (item: Item, property: 'key' | 'value') => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const itemList = items.concat();
        const index = itemList.findIndex((i) => i.id === item.id);

        itemList.splice(index, 1, { ...item, [property]: e.target.value });

        props.sdk.field.setValue(itemList);
    };

    /** Deletes an item from the list */
    const deleteItem = (item: Item) => {
        props.sdk.field.setValue(items.filter((i) => i.id !== item.id));
    };

    /*
    const moveItemUp = (item: Item) => {
        let copyItems = items;
        
        // Find index of item that was clicked
        const indexOfItem = copyItems.indexOf(item);
        
        // Get item from items array
        const element = copyItems.splice(indexOfItem, 1)[0];

        // Insert item into array at new index
        copyItems.splice(indexOfItem-1, 0, element);

        // Update items 
        props.sdk.field.setValue(copyItems);
    }
    const moveItemDown = (item: Item) => {
        setItems([]);
        let copyItems = items;
        
        // Find index of item that was clicked
        const indexOfItem = copyItems.indexOf(item);
        
        // Get item from items array
        const element = copyItems.splice(indexOfItem, 1)[0];

        // Insert item into array at new index
        copyItems.splice(indexOfItem+1, 0, element);

        // Update items 
        props.sdk.field.setValue(copyItems);
    }*/

    return (
        <div>
            <Table>
                <TableBody>
                    {items.map((item,index) => (
                        <DraggableFieldItem 
                            index={index}
                            item={item} 
                            valueName={valueName} 
                            createOnChangeHandler={createOnChangeHandler} 
                            deleteItem={deleteItem}
                            moveDraggableItem={() => {}}
                        ></DraggableFieldItem>
                    ))}
                </TableBody>
            </Table>
            <Button
                buttonType="naked"
                onClick={addNewItem}
                icon="PlusCircle"
                style={{ marginTop: tokens.spacingS }}
            >
                Add Item
            </Button>
        </div>
    );
};

export default Field;
