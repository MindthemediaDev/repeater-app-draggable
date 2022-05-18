import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@contentful/forma-36-react-components";
import tokens from "@contentful/forma-36-tokens";
import { FieldExtensionSDK } from "@contentful/app-sdk";
import { v4 as uuid } from "uuid";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

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
    key: "",
    value: "",
  };
}

/** The Field component is the Repeater App which shows up
 * in the Contentful field.
 *
 * The Field expects and uses a `Contentful JSON field`
 */
const Field = (props: FieldProps) => {
  const { valueName = "Value" } = props.sdk.parameters.instance as any;
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
  const createOnChangeHandler =
    (item: Item, property: "key" | "value") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const itemList = items.concat();
      const index = itemList.findIndex((i) => i.id === item.id);

      itemList.splice(index, 1, { ...item, [property]: e.target.value });

      props.sdk.field.setValue(itemList);
    };

  /** Deletes an item from the list */
  const deleteItem = (item: Item) => {
    props.sdk.field.setValue(items.filter((i) => i.id !== item.id));
  };

  const moveDraggableItem = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const dragItem = items[dragIndex];
      const hoverItem = items[hoverIndex];

      const updatedItems = [...items];
      updatedItems[dragIndex] = hoverItem;
      updatedItems[hoverIndex] = dragItem;

      props.sdk.field.setValue(updatedItems);
    },
    [items, props.sdk]
  );

  const renderFieldItem = useCallback(
    (
      item: Item,
      index: number,
      valueName: String,
      createOnChangeHandler: Function,
      deleteItem: Function,
      moveDraggableItem: Function
    ) => {
      return (
        <DraggableFieldItem
          id={item.id}
          key={item.id}
          index={index}
          item={item}
          valueName={valueName}
          createOnChangeHandler={createOnChangeHandler}
          deleteItem={deleteItem}
          moveDraggableItem={(dragIndex: number, hoverIndex: number) =>
            moveDraggableItem(dragIndex, hoverIndex)
          }
        ></DraggableFieldItem>
      );
    },
    []
  );

  return (
    <div>
      <DndProvider backend={HTML5Backend}>
        <div>
          {items.map((item, index) =>
            renderFieldItem(
              item,
              index,
              valueName,
              createOnChangeHandler,
              deleteItem,
              (dragIndex: number, hoverIndex: number) =>
                moveDraggableItem(dragIndex, hoverIndex)
            )
          )}
        </div>
      </DndProvider>
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
