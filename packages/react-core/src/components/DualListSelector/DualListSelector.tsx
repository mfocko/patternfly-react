import * as React from 'react';
import styles from '@patternfly/react-styles/css/components/DualListSelector/dual-list-selector';
import { css } from '@patternfly/react-styles';
import { Button, ButtonVariant } from '../Button';
import AngleDoubleLeftIcon from '@patternfly/react-icons/dist/esm/icons/angle-double-left-icon';
import AngleLeftIcon from '@patternfly/react-icons/dist/esm/icons/angle-left-icon';
import AngleDoubleRightIcon from '@patternfly/react-icons/dist/esm/icons/angle-double-right-icon';
import AngleRightIcon from '@patternfly/react-icons/dist/esm/icons/angle-right-icon';
import { DualListSelectorPane } from './DualListSelectorPane';
import { getUniqueId, PickOptional } from '../../helpers';
import { DualListSelectorTreeItemData } from './DualListSelectorTree';
import { Tooltip } from '../Tooltip';
import {
  flattenTree,
  flattenTreeWithFolders,
  filterFolders,
  filterTreeItems,
  filterTreeItemsWithoutFolders,
  filterRestTreeItems
} from './treeUtils';
import { canUseDOM } from '../../helpers/util';
import { handleArrows } from '../../helpers';
export interface DualListSelectorProps {
  /** Additional classes applied to the dual list selector. */
  className?: string;
  /** Title applied to the available options pane. */
  availableOptionsTitle?: string;
  /** Options to display in the available options pane. When using trees, the options should be in the DualListSelectorTreeItemData[] format. */
  availableOptions?: React.ReactNode[] | DualListSelectorTreeItemData[];
  /** Status message to display above the available options pane. */
  availableOptionsStatus?: string;
  /** Actions to be displayed above the available options pane. */
  availableOptionsActions?: React.ReactNode[];
  /** Title applied to the chosen options pane. */
  chosenOptionsTitle?: string;
  /** Options to display in the chosen options pane. When using trees, the options should be in the DualListSelectorTreeItemData[] format. */
  chosenOptions?: React.ReactNode[] | DualListSelectorTreeItemData[];
  /** Status message to display above the chosen options pane.*/
  chosenOptionsStatus?: string;
  /** Actions to be displayed above the chosen options pane. */
  chosenOptionsActions?: React.ReactNode[];
  /** Accessible label for the controls between the two panes. */
  controlsAriaLabel?: string;
  /** Optional callback for the add selected button */
  addSelected?: (newAvailableOptions: React.ReactNode[], newChosenOptions: React.ReactNode[]) => void;
  /** Accessible label for the add selected button */
  addSelectedAriaLabel?: string;
  /** Tooltip content for the add selected button */
  addSelectedTooltip?: React.ReactNode;
  /** Additonal tooltip properties for the add selected tooltip */
  addSelectedTooltipProps?: any;
  /** Callback fired every time options are chosen or removed */
  onListChange?: (newAvailableOptions: React.ReactNode[], newChosenOptions: React.ReactNode[]) => void;
  /** Optional callback for the add all button */
  addAll?: (newAvailableOptions: React.ReactNode[], newChosenOptions: React.ReactNode[]) => void;
  /** Accessible label for the add all button */
  addAllAriaLabel?: string;
  /** Tooltip content for the add all button */
  addAllTooltip?: React.ReactNode;
  /** Additonal tooltip properties for the add all tooltip */
  addAllTooltipProps?: any;
  /** Optional callback for the remove selected button */
  removeSelected?: (newAvailableOptions: React.ReactNode[], newChosenOptions: React.ReactNode[]) => void;
  /** Accessible label for the remove selected button */
  removeSelectedAriaLabel?: string;
  /** Tooltip content for the remove selected button */
  removeSelectedTooltip?: React.ReactNode;
  /** Additonal tooltip properties for the remove selected tooltip  */
  removeSelectedTooltipProps?: any;
  /** Optional callback for the remove all button */
  removeAll?: (newAvailableOptions: React.ReactNode[], newChosenOptions: React.ReactNode[]) => void;
  /** Accessible label for the remove all button */
  removeAllAriaLabel?: string;
  /** Tooltip content for the remove all button */
  removeAllTooltip?: React.ReactNode;
  /** Additonal tooltip properties for the remove all tooltip */
  removeAllTooltipProps?: any;
  /** Optional callback fired when an option is selected */
  onOptionSelect?: (e: React.MouseEvent | React.ChangeEvent) => void;
  /** Optional callback fired when an option is checked */
  onOptionCheck?: (
    e: React.MouseEvent | React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
    checkedId: string,
    newCheckedItems: string[]
  ) => void;
  /** Flag indicating a search bar should be included above both the available and chosen panes. */
  isSearchable?: boolean;
  /** Accessible label for the search input on the available options pane. */
  availableOptionsSearchAriaLabel?: string;
  /** A callback for when the search input value for available options changes. */
  onAvailableOptionsSearchInputChanged?: (value: string, event: React.FormEvent<HTMLInputElement>) => void;
  /** Accessible label for the search input on the chosen options pane. */
  chosenOptionsSearchAriaLabel?: string;
  /** A callback for when the search input value for chosen options changes. */
  onChosenOptionsSearchInputChanged?: (value: string, event: React.FormEvent<HTMLInputElement>) => void;
  /** Optional filter function for custom filtering based on search string. */
  filterOption?: (option: React.ReactNode, input: string) => boolean;
  /** Id of the dual list selector. */
  id?: string;
  /* Flag indicating if the dual list selector uses trees instead of simple lists */
  isTree?: boolean;
}

interface DualListSelectorState {
  availableOptions: React.ReactNode[];
  availableOptionsSelected: number[];
  availableFilteredOptions: React.ReactNode[];
  chosenOptions: React.ReactNode[];
  chosenOptionsSelected: number[];
  chosenFilteredOptions: React.ReactNode[];
  availableTreeOptionsSelected: string[];
  availableTreeFilteredOptions: string[];
  chosenTreeOptionsSelected: string[];
  availableTreeOptionsChecked: string[];
  chosenTreeOptionsChecked: string[];
  chosenTreeFilteredOptions: string[];
}

export class DualListSelector extends React.Component<DualListSelectorProps, DualListSelectorState> {
  static displayName = 'DualListSelector';
  private controlsEl = React.createRef<HTMLDivElement>();
  private addAllButtonRef = React.createRef<HTMLButtonElement>();
  private addSelectedButtonRef = React.createRef<HTMLButtonElement>();
  private removeSelectedButtonRef = React.createRef<HTMLButtonElement>();
  private removeAllButtonRef = React.createRef<HTMLButtonElement>();
  static defaultProps: PickOptional<DualListSelectorProps> = {
    availableOptions: [] as React.ReactNode[],
    availableOptionsTitle: 'Available options',
    availableOptionsSearchAriaLabel: 'Available search input',
    chosenOptions: [] as React.ReactNode[],
    chosenOptionsTitle: 'Chosen options',
    chosenOptionsSearchAriaLabel: 'Chosen search input',
    id: getUniqueId('dual-list-selector'),
    controlsAriaLabel: 'Selector controls',
    addAllAriaLabel: 'Add all',
    addSelectedAriaLabel: 'Add selected',
    removeSelectedAriaLabel: 'Remove selected',
    removeAllAriaLabel: 'Remove all'
  };
  private originalAvailableCopy = this.props.availableOptions;
  private originalChosenCopy = this.props.chosenOptions;

  constructor(props: DualListSelectorProps) {
    super(props);
    this.state = {
      availableOptions: [...this.props.availableOptions],
      availableOptionsSelected: [],
      availableFilteredOptions: null,
      availableTreeFilteredOptions: null,
      chosenOptions: [...this.props.chosenOptions],
      chosenOptionsSelected: [],
      chosenFilteredOptions: null,
      chosenTreeFilteredOptions: null,
      availableTreeOptionsSelected: [],
      chosenTreeOptionsSelected: [],
      availableTreeOptionsChecked: [],
      chosenTreeOptionsChecked: []
    };
  }

  componentDidUpdate() {
    if (
      JSON.stringify(this.props.availableOptions) !== JSON.stringify(this.state.availableOptions) ||
      JSON.stringify(this.props.chosenOptions) !== JSON.stringify(this.state.chosenOptions)
    ) {
      this.setState({
        availableOptions: [...this.props.availableOptions],
        chosenOptions: [...this.props.chosenOptions]
      });
    }
  }

  onFilterUpdate = (newFilteredOptions: React.ReactNode[], paneType: string, isSearchReset: boolean) => {
    const { isTree } = this.props;
    if (paneType === 'available') {
      if (isSearchReset) {
        this.setState({
          availableFilteredOptions: null,
          availableTreeFilteredOptions: null
        });
        return;
      }
      if (isTree) {
        this.setState({
          availableTreeFilteredOptions: flattenTreeWithFolders(newFilteredOptions as DualListSelectorTreeItemData[])
        });
      } else {
        this.setState({
          availableFilteredOptions: newFilteredOptions as React.ReactNode[]
        });
      }
    } else if (paneType === 'chosen') {
      if (isSearchReset) {
        this.setState({
          chosenFilteredOptions: null,
          chosenTreeFilteredOptions: null
        });
        return;
      }
      if (isTree) {
        this.setState({
          chosenTreeFilteredOptions: flattenTreeWithFolders(newFilteredOptions as DualListSelectorTreeItemData[])
        });
      } else {
        this.setState({
          chosenFilteredOptions: newFilteredOptions as React.ReactNode[]
        });
      }
    }
  };

  addAllVisible = () => {
    this.setState(prevState => {
      const itemsToRemove = [] as React.ReactNode[];
      const newAvailable = [] as React.ReactNode[];
      const movedOptions = prevState.availableFilteredOptions || prevState.availableOptions;
      prevState.availableOptions.forEach(value => {
        if (movedOptions.indexOf(value) !== -1) {
          itemsToRemove.push(value);
        } else {
          newAvailable.push(value);
        }
      });

      const newChosen = [...prevState.chosenOptions, ...itemsToRemove];
      this.props.addAll && this.props.addAll(newAvailable, newChosen);
      this.props.onListChange && this.props.onListChange(newAvailable, newChosen);

      return {
        chosenOptions: newChosen,
        availableOptions: newAvailable,
        chosenOptionsSelected: [],
        availableOptionsSelected: []
      };
    });
  };

  addAllTreeVisible = () => {
    this.setState(prevState => {
      const movedOptions =
        prevState.availableTreeFilteredOptions ||
        flattenTreeWithFolders(prevState.availableOptions as DualListSelectorTreeItemData[]);

      const newAvailable = prevState.availableOptions
        .map(opt => Object.assign({}, opt))
        .filter(item => filterRestTreeItems(item as DualListSelectorTreeItemData, movedOptions));

      const currChosen = flattenTree(prevState.chosenOptions as DualListSelectorTreeItemData[]);
      const nextChosenOptions = currChosen.concat(movedOptions);

      const allOptions = (this.originalAvailableCopy as DualListSelectorTreeItemData[]).concat(
        this.originalChosenCopy as DualListSelectorTreeItemData[]
      );
      const newChosen = allOptions
        .map(opt => Object.assign({}, opt))
        .filter(item => filterTreeItemsWithoutFolders(item as DualListSelectorTreeItemData, nextChosenOptions));

      this.props.addAll && this.props.addAll(newAvailable, newChosen);
      this.props.onListChange && this.props.onListChange(newAvailable, newChosen);

      return {
        chosenOptions: newChosen,
        chosenFilteredOptions: newChosen,
        availableOptions: newAvailable,
        availableFilteredOptions: newAvailable,
        availableTreeOptionsSelected: [],
        chosenTreeOptionsSelected: [],
        availableTreeOptionsChecked: [],
        chosenTreeOptionsChecked: []
      };
    });
  };

  addSelected = () => {
    this.setState(prevState => {
      const itemsToRemove = [] as React.ReactNode[];
      const newAvailable = [] as React.ReactNode[];
      prevState.availableOptions.forEach((value, index) => {
        if (prevState.availableOptionsSelected.indexOf(index) !== -1) {
          itemsToRemove.push(value);
        } else {
          newAvailable.push(value);
        }
      });

      const newChosen = [...prevState.chosenOptions, ...itemsToRemove];
      this.props.addSelected && this.props.addSelected(newAvailable, newChosen);
      this.props.onListChange && this.props.onListChange(newAvailable, newChosen);

      return {
        chosenOptionsSelected: [],
        availableOptionsSelected: [],
        chosenOptions: newChosen,
        availableOptions: newAvailable
      };
    });
  };

  addTreeSelected = () => {
    this.setState(prevState => {
      // Remove selected available nodes from current available nodes
      const newAvailable = prevState.availableOptions
        .map(opt => Object.assign({}, opt))
        .filter(item =>
          filterRestTreeItems(item as DualListSelectorTreeItemData, prevState.availableTreeOptionsSelected)
        );

      // Get next chosen options from current + new nodes and remap from base
      const currChosen = flattenTree(prevState.chosenOptions as DualListSelectorTreeItemData[]);
      const nextChosenOptions = currChosen.concat(prevState.availableTreeOptionsSelected);
      const allOptions = (this.originalAvailableCopy as DualListSelectorTreeItemData[]).concat(
        this.originalChosenCopy as DualListSelectorTreeItemData[]
      );
      const newChosen = allOptions
        .map(opt => Object.assign({}, opt))
        .filter(item => filterTreeItemsWithoutFolders(item as DualListSelectorTreeItemData, nextChosenOptions));

      this.props.addSelected && this.props.addSelected(newAvailable, newChosen);
      this.props.onListChange && this.props.onListChange(newAvailable, newChosen);

      return {
        availableTreeOptionsSelected: [],
        chosenTreeOptionsSelected: [],
        availableTreeOptionsChecked: [],
        chosenTreeOptionsChecked: [],
        availableOptions: newAvailable,
        chosenOptions: newChosen
      };
    });
  };

  removeAllVisible = () => {
    this.setState(prevState => {
      const itemsToRemove = [] as React.ReactNode[];
      const newChosen = [] as React.ReactNode[];
      const movedOptions = prevState.chosenFilteredOptions || prevState.chosenOptions;
      prevState.chosenOptions.forEach(value => {
        if (movedOptions.indexOf(value) !== -1) {
          itemsToRemove.push(value);
        } else {
          newChosen.push(value);
        }
      });

      const newAvailable = [...prevState.availableOptions, ...itemsToRemove];
      this.props.removeAll && this.props.removeAll(newAvailable, newChosen);
      this.props.onListChange && this.props.onListChange(newAvailable, newChosen);

      return {
        chosenOptions: newChosen,
        availableOptions: newAvailable,
        chosenOptionsSelected: [],
        availableOptionsSelected: []
      };
    });
  };

  removeAllTreeVisible = () => {
    this.setState(prevState => {
      const movedOptions =
        prevState.chosenTreeFilteredOptions ||
        flattenTreeWithFolders(prevState.chosenOptions as DualListSelectorTreeItemData[]);

      const newChosen = prevState.chosenOptions
        .map(opt => Object.assign({}, opt))
        .filter(item => filterRestTreeItems(item as DualListSelectorTreeItemData, movedOptions));
      const currAvailable = flattenTree(prevState.availableOptions as DualListSelectorTreeItemData[]);
      const nextAvailableOptions = currAvailable.concat(movedOptions);

      const allOptions = (this.originalAvailableCopy as DualListSelectorTreeItemData[]).concat(
        this.originalChosenCopy as DualListSelectorTreeItemData[]
      );
      const newAvailable = allOptions
        .map(opt => Object.assign({}, opt))
        .filter(item => filterTreeItemsWithoutFolders(item as DualListSelectorTreeItemData, nextAvailableOptions));

      this.props.removeAll && this.props.removeAll(newAvailable, newChosen);
      this.props.onListChange && this.props.onListChange(newAvailable, newChosen);

      return {
        chosenOptions: newChosen,
        availableOptions: newAvailable,
        availableTreeOptionsSelected: [],
        chosenTreeOptionsSelected: [],
        availableTreeOptionsChecked: [],
        chosenTreeOptionsChecked: []
      };
    });
  };

  removeSelected = () => {
    this.setState(prevState => {
      const itemsToRemove = [] as React.ReactNode[];
      const newChosen = [] as React.ReactNode[];
      prevState.chosenOptions.forEach((value, index) => {
        if (prevState.chosenOptionsSelected.indexOf(index) !== -1) {
          itemsToRemove.push(value);
        } else {
          newChosen.push(value);
        }
      });

      const newAvailable = [...prevState.availableOptions, ...itemsToRemove];
      this.props.removeSelected && this.props.removeSelected(newAvailable, newChosen);
      this.props.onListChange && this.props.onListChange(newAvailable, newChosen);

      return {
        chosenOptionsSelected: [],
        availableOptionsSelected: [],
        chosenOptions: newChosen,
        availableOptions: newAvailable
      };
    });
  };

  removeTreeSelected = () => {
    this.setState(prevState => {
      // Remove selected chosen nodes from current chosen nodes
      const newChosen = prevState.chosenOptions
        .map(opt => Object.assign({}, opt))
        .filter(item => filterRestTreeItems(item as DualListSelectorTreeItemData, prevState.chosenTreeOptionsSelected));

      // Get next chosen options from current and remap from base
      const currAvailable = flattenTree(prevState.availableOptions as DualListSelectorTreeItemData[]);
      const nextAvailableOptions = currAvailable.concat(prevState.chosenTreeOptionsSelected);

      const allOptions = (this.originalAvailableCopy as DualListSelectorTreeItemData[]).concat(
        this.originalChosenCopy as DualListSelectorTreeItemData[]
      );
      const newAvailable = allOptions
        .map(opt => Object.assign({}, opt))
        .filter(item => filterTreeItemsWithoutFolders(item as DualListSelectorTreeItemData, nextAvailableOptions));

      this.props.removeSelected && this.props.removeSelected(newAvailable, newChosen);
      this.props.onListChange && this.props.onListChange(newAvailable, newChosen);

      return {
        availableTreeOptionsSelected: [],
        chosenTreeOptionsSelected: [],
        availableTreeOptionsChecked: [],
        chosenTreeOptionsChecked: [],
        availableOptions: newAvailable,
        chosenOptions: newChosen
      };
    });
  };

  onOptionSelect = (
    e: React.MouseEvent | React.ChangeEvent,
    index: number,
    isChosen: boolean,
    /* eslint-disable @typescript-eslint/no-unused-vars */
    id?: string,
    itemData?: any,
    parentData?: any
    /* eslint-enable @typescript-eslint/no-unused-vars */
  ) => {
    this.setState(prevState => {
      const originalArray = isChosen ? prevState.chosenOptionsSelected : prevState.availableOptionsSelected;

      let updatedArray = null;
      if (originalArray.indexOf(index) !== -1) {
        updatedArray = originalArray.filter(value => value !== index);
      } else {
        updatedArray = [...originalArray, index];
      }

      return {
        chosenOptionsSelected: isChosen ? updatedArray : prevState.chosenOptionsSelected,
        availableOptionsSelected: isChosen ? prevState.availableOptionsSelected : updatedArray
      };
    });

    this.props.onOptionSelect && this.props.onOptionSelect(e);
  };

  onTreeOptionSelect = (
    e: React.MouseEvent | React.ChangeEvent,
    index: number,
    isChosen: boolean,
    id?: string,
    itemData?: any,
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    parentData?: any
  ) => {
    this.setState(prevState => {
      const selectedOptions = isChosen ? prevState.chosenTreeOptionsSelected : prevState.availableTreeOptionsSelected;

      let updatedArray = null;
      if (itemData.children) {
        const panelOptions = isChosen ? this.state.chosenOptions : this.state.availableOptions;
        const selectedOptionTree = panelOptions
          .map(opt => Object.assign({}, opt))
          .filter(item => filterTreeItems(item as DualListSelectorTreeItemData, [id]));
        const flatSelectedItems = flattenTreeWithFolders(selectedOptionTree as DualListSelectorTreeItemData[]);

        if (selectedOptions.includes(id)) {
          updatedArray = selectedOptions.filter(id => !flatSelectedItems.includes(id));
        } else {
          updatedArray = selectedOptions.concat(flatSelectedItems.filter(id => !selectedOptions.includes(id)));
        }
      } else {
        if (selectedOptions.includes(id)) {
          updatedArray = selectedOptions.filter(id => !selectedOptions.includes(id));
        } else {
          updatedArray = [...selectedOptions, id];
        }
      }

      return {
        chosenTreeOptionsSelected: isChosen ? updatedArray : prevState.chosenTreeOptionsSelected,
        availableTreeOptionsSelected: isChosen ? prevState.availableTreeOptionsSelected : updatedArray
      };
    });

    this.props.onOptionSelect && this.props.onOptionSelect(e);
  };

  isChecked = (treeItem: DualListSelectorTreeItemData, isChosen: boolean) =>
    isChosen
      ? this.state.chosenTreeOptionsChecked.includes(treeItem.id)
      : this.state.availableTreeOptionsChecked.includes(treeItem.id);
  areAllDescendantsChecked = (treeItem: DualListSelectorTreeItemData, isChosen: boolean): boolean =>
    treeItem.children
      ? treeItem.children.every(child => this.areAllDescendantsChecked(child, isChosen))
      : this.isChecked(treeItem, isChosen);
  areSomeDescendantsChecked = (treeItem: DualListSelectorTreeItemData, isChosen: boolean): boolean =>
    treeItem.children
      ? treeItem.children.some(child => this.areSomeDescendantsChecked(child, isChosen))
      : this.isChecked(treeItem, isChosen);

  mapChecked = (item: DualListSelectorTreeItemData, isChosen: boolean): DualListSelectorTreeItemData => {
    const hasCheck = this.areAllDescendantsChecked(item, isChosen);
    item.isChecked = false;

    if (hasCheck) {
      item.isChecked = true;
    } else {
      const hasPartialCheck = this.areSomeDescendantsChecked(item, isChosen);
      if (hasPartialCheck) {
        item.isChecked = null;
      }
    }

    if (item.children) {
      return {
        ...item,
        children: item.children.map(child => this.mapChecked(child, isChosen))
      };
    }
    return item;
  };

  onTreeOptionCheck = (
    evt: React.MouseEvent | React.ChangeEvent<HTMLInputElement>,
    isChecked: boolean,
    isChosen: boolean,
    itemData: DualListSelectorTreeItemData
  ) => {
    const { availableOptions, availableTreeFilteredOptions, chosenOptions, chosenTreeFilteredOptions } = this.state;
    const checked = (evt as React.ChangeEvent<HTMLInputElement>).target.checked
      ? (evt as React.ChangeEvent<HTMLInputElement>).target.checked
      : isChecked;
    let panelOptions;
    if (isChosen) {
      if (chosenTreeFilteredOptions) {
        panelOptions = chosenOptions
          .map(opt => Object.assign({}, opt))
          .filter(item =>
            filterTreeItemsWithoutFolders(item as DualListSelectorTreeItemData, chosenTreeFilteredOptions)
          );
      } else {
        panelOptions = chosenOptions;
      }
    } else {
      if (availableTreeFilteredOptions) {
        panelOptions = availableOptions
          .map(opt => Object.assign({}, opt))
          .filter(item =>
            filterTreeItemsWithoutFolders(item as DualListSelectorTreeItemData, availableTreeFilteredOptions)
          );
      } else {
        panelOptions = availableOptions;
      }
    }
    const checkedOptionTree = panelOptions
      .map(opt => Object.assign({}, opt))
      .filter(item => filterTreeItems(item as DualListSelectorTreeItemData, [itemData.id]));
    const flatTree = flattenTreeWithFolders(checkedOptionTree as DualListSelectorTreeItemData[]);

    const prevChecked = isChosen ? this.state.chosenTreeOptionsChecked : this.state.availableTreeOptionsChecked;
    let updatedChecked = [] as string[];
    let updatedSelected = [] as string[];
    const selectedOptions = isChosen ? this.state.chosenTreeOptionsSelected : this.state.availableTreeOptionsSelected;
    if (checked) {
      updatedChecked = prevChecked.concat(flatTree.filter(id => !prevChecked.includes(id)));
      updatedSelected = selectedOptions.concat(flatTree.filter(id => !selectedOptions.includes(id)));
    } else {
      updatedChecked = prevChecked.filter(id => !flatTree.includes(id));
      updatedSelected = selectedOptions.filter(id => !flatTree.includes(id));
    }

    this.setState(
      prevState => ({
        availableTreeOptionsChecked: isChosen ? prevState.availableTreeOptionsChecked : updatedChecked,
        chosenTreeOptionsChecked: isChosen ? updatedChecked : prevState.chosenTreeOptionsChecked,
        availableTreeOptionsSelected: isChosen ? prevState.availableTreeOptionsSelected : updatedSelected,
        chosenTreeOptionsSelected: isChosen ? updatedSelected : prevState.chosenTreeOptionsSelected
      }),
      () => {
        this.props.onOptionCheck && this.props.onOptionCheck(evt, isChecked, itemData.id, updatedChecked);
      }
    );

    this.props.onOptionSelect && this.props.onOptionSelect(evt);
  };

  handleKeys = (event: KeyboardEvent) => {
    if (
      !this.controlsEl.current ||
      (this.controlsEl.current !== (event.target as HTMLElement).closest('.pf-c-dual-list-selector__controls') &&
        !Array.from(this.controlsEl.current.getElementsByClassName('pf-c-dual-list-selector__controls')).includes(
          (event.target as HTMLElement).closest('.pf-c-dual-list-selector__controls')
        ))
    ) {
      return;
    }
    event.stopImmediatePropagation();

    const controls = Array.from(this.controlsEl.current.getElementsByTagName('BUTTON')).filter(
      el => !el.classList.contains('pf-m-disabled')
    );
    const activeElement = document.activeElement;
    handleArrows(
      event,
      controls,
      (element: Element) => activeElement.contains(element),
      (element: Element) => element,
      undefined,
      undefined,
      true,
      false
    );
  };

  componentDidMount() {
    if (canUseDOM) {
      window.addEventListener('keydown', this.handleKeys);
    }
  }

  componentWillUnmount() {
    if (canUseDOM) {
      window.removeEventListener('keydown', this.handleKeys);
    }
  }

  render() {
    const {
      availableOptionsTitle,
      availableOptionsActions,
      availableOptionsSearchAriaLabel,
      className,
      chosenOptionsTitle,
      chosenOptionsActions,
      chosenOptionsSearchAriaLabel,
      filterOption,
      isSearchable,
      chosenOptionsStatus,
      availableOptionsStatus,
      controlsAriaLabel,
      addAllAriaLabel,
      addSelectedAriaLabel,
      removeSelectedAriaLabel,
      removeAllAriaLabel,
      /* eslint-disable @typescript-eslint/no-unused-vars */
      availableOptions: consumerPassedAvailableOptions,
      chosenOptions: consumerPassedChosenOptions,
      removeSelected,
      addAll,
      removeAll,
      addSelected,
      onListChange,
      onAvailableOptionsSearchInputChanged,
      onChosenOptionsSearchInputChanged,
      onOptionSelect,
      onOptionCheck,
      id,
      isTree,
      addAllTooltip,
      addAllTooltipProps,
      addSelectedTooltip,
      addSelectedTooltipProps,
      removeAllTooltip,
      removeAllTooltipProps,
      removeSelectedTooltip,
      removeSelectedTooltipProps,
      ...props
    } = this.props;
    const {
      availableOptions,
      chosenOptions,
      chosenOptionsSelected,
      availableOptionsSelected,
      chosenTreeOptionsSelected,
      availableTreeOptionsSelected
    } = this.state;

    const availableOptionsStatusToDisplay =
      availableOptionsStatus ||
      (isTree
        ? `${
            filterFolders(availableOptions as DualListSelectorTreeItemData[], availableTreeOptionsSelected).length
          } of ${flattenTree(availableOptions as DualListSelectorTreeItemData[]).length} items selected`
        : `${availableOptionsSelected.length} of ${availableOptions.length} items selected`);
    const chosenOptionsStatusToDisplay =
      chosenOptionsStatus ||
      (isTree
        ? `${filterFolders(chosenOptions as DualListSelectorTreeItemData[], chosenTreeOptionsSelected).length} of ${
            flattenTree(chosenOptions as DualListSelectorTreeItemData[]).length
          } items selected`
        : `${chosenOptionsSelected.length} of ${chosenOptions.length} items selected`);

    const available = isTree
      ? availableOptions.map(item => this.mapChecked(item as DualListSelectorTreeItemData, false))
      : availableOptions;
    const chosen = isTree
      ? chosenOptions.map(item => this.mapChecked(item as DualListSelectorTreeItemData, true))
      : chosenOptions;

    return (
      <div className={css(styles.dualListSelector, className)} id={id} {...props}>
        <DualListSelectorPane
          isSearchable={isSearchable}
          onFilterUpdate={this.onFilterUpdate}
          searchInputAriaLabel={availableOptionsSearchAriaLabel}
          filterOption={filterOption}
          onSearchInputChanged={onAvailableOptionsSearchInputChanged}
          status={availableOptionsStatusToDisplay}
          title={availableOptionsTitle}
          options={available}
          selectedOptions={isTree ? availableTreeOptionsSelected : availableOptionsSelected}
          onOptionSelect={isTree ? this.onTreeOptionSelect : this.onOptionSelect}
          onOptionCheck={this.onTreeOptionCheck}
          actions={availableOptionsActions}
          id={`${id}-available-pane`}
          isTree={isTree}
        />
        <div
          className={css(styles.dualListSelectorControls)}
          tabIndex={0}
          ref={this.controlsEl}
          aria-label={controlsAriaLabel}
        >
          <div className={css('pf-c-dual-list-selector__controls-item')}>
            <Button
              isDisabled={isTree ? availableTreeOptionsSelected.length === 0 : availableOptionsSelected.length === 0}
              aria-disabled={isTree ? availableTreeOptionsSelected.length === 0 : availableOptionsSelected.length === 0}
              variant={ButtonVariant.plain}
              onClick={isTree ? this.addTreeSelected : this.addSelected}
              aria-label={addSelectedAriaLabel}
              tabIndex={-1}
              ref={this.addSelectedButtonRef}
            >
              <AngleRightIcon />
            </Button>
            {addSelectedTooltip && (
              <Tooltip
                content={addSelectedTooltip}
                position="right"
                reference={this.addSelectedButtonRef}
                {...addSelectedTooltipProps}
              />
            )}
          </div>
          <div className={css('pf-c-dual-list-selector__controls-item')}>
            <Button
              isDisabled={availableOptions.length === 0}
              aria-disabled={availableOptions.length === 0}
              variant={ButtonVariant.plain}
              onClick={isTree ? this.addAllTreeVisible : this.addAllVisible}
              aria-label={addAllAriaLabel}
              tabIndex={-1}
              ref={this.addAllButtonRef}
            >
              <AngleDoubleRightIcon />
            </Button>
            {addAllTooltip && (
              <Tooltip
                content={addAllTooltip}
                position="left"
                reference={this.addAllButtonRef}
                {...addAllTooltipProps}
              />
            )}
          </div>
          <div className={css('pf-c-dual-list-selector__controls-item')}>
            <Button
              isDisabled={chosenOptions.length === 0}
              aria-disabled={chosenOptions.length === 0}
              variant={ButtonVariant.plain}
              onClick={isTree ? this.removeAllTreeVisible : this.removeAllVisible}
              aria-label={removeAllAriaLabel}
              tabIndex={-1}
              ref={this.removeAllButtonRef}
            >
              <AngleDoubleLeftIcon />
            </Button>
            {removeAllTooltip && (
              <Tooltip
                content={removeAllTooltip}
                position="right"
                reference={this.removeAllButtonRef}
                {...removeAllTooltipProps}
              />
            )}
          </div>
          <div className={css('pf-c-dual-list-selector__controls-item')}>
            <Button
              variant={ButtonVariant.plain}
              onClick={isTree ? this.removeTreeSelected : this.removeSelected}
              aria-label={removeSelectedAriaLabel}
              tabIndex={-1}
              isDisabled={isTree ? chosenTreeOptionsSelected.length === 0 : chosenOptionsSelected.length === 0}
              aria-disabled={isTree ? chosenTreeOptionsSelected.length === 0 : chosenOptionsSelected.length === 0}
              ref={this.removeSelectedButtonRef}
            >
              <AngleLeftIcon />
            </Button>
            {removeSelectedTooltip && (
              <Tooltip
                content={removeSelectedTooltip}
                position="left"
                reference={this.removeSelectedButtonRef}
                {...removeSelectedTooltipProps}
              />
            )}
          </div>
        </div>
        <DualListSelectorPane
          isChosen
          isSearchable={isSearchable}
          onFilterUpdate={this.onFilterUpdate}
          searchInputAriaLabel={chosenOptionsSearchAriaLabel}
          filterOption={filterOption}
          onSearchInputChanged={onChosenOptionsSearchInputChanged}
          title={chosenOptionsTitle}
          status={chosenOptionsStatusToDisplay}
          options={chosen}
          selectedOptions={isTree ? chosenTreeOptionsSelected : chosenOptionsSelected}
          onOptionSelect={isTree ? this.onTreeOptionSelect : this.onOptionSelect}
          onOptionCheck={this.onTreeOptionCheck}
          actions={chosenOptionsActions}
          id={`${id}-chosen-pane`}
          isTree={isTree}
        />
      </div>
    );
  }
}
