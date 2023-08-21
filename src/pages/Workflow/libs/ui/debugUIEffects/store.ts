import { IButtonGroupProps, IResultTextProps, ITextFieldProps } from '@/pages/Workflow/libs/ui/types/UIEffectsContext';
import { isUndefined, mergeWith } from 'lodash';
import { createStore } from 'zustand/vanilla';

export interface UIElementState {
  /**
   * The data to submit to the noflo node.
   * can be string for textField or clicked index of buttons for buttonGroup, etc.
   */
  content: unknown;
  id: string;
  isSubmitted: boolean;
  /**
   * Props for UI element. See ITextFieldProps and IButtonGroupProps for example, this can be added by plugin, so can't be statically typed, just as an example here.
   */
  props: ITextFieldProps | IButtonGroupProps | IResultTextProps | Record<string, unknown>;
  timestamp: number;
  type: 'textField' | 'buttonGroup' | 'textResult' | string;
}

export interface UIStoreState {
  /** adds element and returns its ID */
  addElement: (element: Pick<UIElementState, 'type' | 'props'>) => string;
  clearElements: () => void;
  elements: Record<string, UIElementState | undefined>;
  removeElement: (id: string) => void;
  submitElement: (id: string, content: unknown) => void;
  /** update existing element with new props, props will merge with old props, undefined value will be omitted (to use old value) */
  updateElementProps: (element: Pick<UIElementState, 'id' | 'props'>) => void;
}

/**
 * Props for UI element to support submit
 */
export interface IUiElementSubmitProps {
  id: string;
  isSubmitted: boolean;
  onSubmit: (id: string, content: unknown) => void;
}

export const uiStore = createStore<UIStoreState>((set) => ({
  elements: {},
  addElement: ({ type, props }) => {
    const id = String(Math.random());
    const newElement = {
      content: undefined,
      id,
      timestamp: Date.now(),
      isSubmitted: false,
      props,
      type,
    };
    set((state) => ({ elements: { ...state.elements, [id]: newElement } }));
    return id;
  },
  updateElementProps: ({ id, props }) => {
    set((state) => {
      const existedElement = state.elements[id];
      if (existedElement !== undefined) {
        mergeWith(existedElement.props, props, (objectValue: unknown, sourceValue) => {
          if (isUndefined(sourceValue)) {
            return objectValue;
          }
        });
      }
      return { elements: { ...state.elements, [id]: existedElement } };
    });
  },
  submitElement: (id, content) => {
    set((state) => {
      const existedElement = state.elements[id];
      if (existedElement !== undefined) {
        existedElement.content = content;
        existedElement.isSubmitted = true;
      }
      return { elements: { ...state.elements, [id]: existedElement } };
    });
  },
  removeElement: (id) => {
    set((state) => {
      const newElements = { ...state.elements, [id]: undefined };
      return { elements: newElements };
    });
  },
  clearElements: () => {
    set({ elements: {} });
  },
}));