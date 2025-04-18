---
id: Table
section: components
---

import { Checkbox, ToolbarExpandIconWrapper, ToolbarContent } from '@patternfly/react-core';
import CodeIcon from '@patternfly/react-icons/dist/esm/icons/code-icon';
import CodeBranchIcon from '@patternfly/react-icons/dist/esm/icons/code-branch-icon';
import CubeIcon from '@patternfly/react-icons/dist/esm/icons/cube-icon';
import FilterIcon from '@patternfly/react-icons/dist/esm/icons/filter-icon';
import SortAmountDownIcon from '@patternfly/react-icons/dist/esm/icons/sort-amount-down-icon';
import SearchIcon from '@patternfly/react-icons/dist/esm/icons/search-icon';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import CogIcon from '@patternfly/react-icons/dist/esm/icons/cog-icon';
import HelpIcon from '@patternfly/react-icons/dist/esm/icons/help-icon';
import globalDangerColor200 from '@patternfly/react-tokens/dist/esm/global_danger_color_200';
import imgBrand from '@patternfly/react-core/src/components/Brand/examples/pfLogo.svg';
import imgAvatar from '@patternfly/react-core/src/components/Avatar/examples/avatarImg.svg';
import AngleDownIcon from '@patternfly/react-icons/dist/esm/icons/angle-down-icon';
import AngleRightIcon from '@patternfly/react-icons/dist/esm/icons/angle-right-icon';

### Bulk select

```js
import React from 'react';
import {
  Dropdown,
  DropdownItem,
  DropdownPosition,
  DropdownToggle,
  DropdownToggleCheckbox,
  Pagination,
  Title,
  Toolbar,
  ToolbarGroup,
  ToolbarItem
} from '@patternfly/react-core';
import { Table, TableHeader, TableBody } from '@patternfly/react-table';

class BulkSelectTableDemo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      res: [],
      perPage: 20,
      page: 1,
      error: null,
      loading: true,
      selectedItems: [],
      numSelected: 0,
      isDropDownOpen: false,
      isKebabOpen: false,
      searchValue: ''
    };

    this.onSelect = (event, isSelected, rowId) => {
      const { selectedItems } = this.state;
      const rows = [...this.state.res];
      const id = rows[rowId].id;
      rows[rowId].selected = isSelected;
      this.setState((prevState, props) => {
        return {
          res: rows,
          selectedItems: isSelected
            ? [...prevState.selectedItems, id]
            : prevState.selectedItems.filter(itemId => itemId !== id)
        };
      });
    };

    this.updateSelected = () => {
      const { res, selectedItems } = this.state;
      let rows = res.map(post => {
        post.selected = selectedItems.includes(post.id);
        return post;
      });

      this.setState({
        res: rows
      });
    };

    this.handleSelectClick = newState => {
      if (newState === 'none') {
        this.setState(
          {
            selectedItems: []
          },
          this.updateSelected
        );
      } else if (newState === 'page') {
        let newRows = [];
        let rows = this.state.res.map(post => {
          const isSelected = post.selected;
          newRows = isSelected ? [...newRows] : [...newRows, post.id];
          post.selected = true;
          return post;
        });

        this.setState((prevState, props) => {
          return {
            selectedItems: prevState.selectedItems.concat(newRows)
          };
        }, this.updateSelected);
      } else {
        let newRows = [];
        for (var i = 1; i <= 100; i++) newRows = [...newRows, i];

        this.setState(
          {
            selectedItems: newRows
          },
          this.updateSelected
        );
      }
    };

    this.onDropDownToggle = isOpen => {
      this.setState({
        isDropDownOpen: isOpen
      });
    };

    this.onDropDownSelect = event => {
      this.setState((prevState, props) => {
        return { isDropDownOpen: !prevState.isDropDownOpen };
      });
    };

  }

  fetch(page, perPage) {
    this.setState({ loading: true });
    fetch(`https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=${perPage}`)
      .then(resp => resp.json())
      .then(resp => this.setState({ res: resp, perPage, page, loading: false }))
      .then(() => this.updateSelected())
      .catch(err => this.setState({ error: err, loading: false }));
  }

  componentDidMount() {
    this.fetch(this.state.page, this.state.perPage);
  }

  renderPagination(variant) {
    const { page, perPage } = this.state;
    return (
      <Pagination
        isCompact
        itemCount={100}
        page={page}
        perPage={perPage}
        onSetPage={(_evt, value) => {
          this.fetch(value, perPage);
        }}
        onPerPageSelect={(_evt, value) => {
          this.fetch(1, value);
        }}
        variant={variant}
        titles={{
          paginationTitle: `${variant} pagination`
        }}
      />
    );
  }

  buildSelectDropdown() {
    const { isDropDownOpen, selectedItems } = this.state;
    const numSelected = selectedItems.length;
    const allSelected = numSelected === 100;
    const anySelected = numSelected > 0;
    const someChecked = anySelected ? null : false;
    const isChecked = allSelected ? true : someChecked;

    const items = [
      <DropdownItem key="item-1" onClick={() => this.handleSelectClick('none')}>
        Select none (0 items)
      </DropdownItem>,
      <DropdownItem key="item-2" onClick={() => this.handleSelectClick('page')}>
        Select page ({this.state.perPage} items)
      </DropdownItem>,
      <DropdownItem key="item-3" onClick={() => this.handleSelectClick('all')}>
        Select all (100 items)
      </DropdownItem>
    ];

    return (
      <Dropdown
        onSelect={this.onDropDownSelect}
        position={DropdownPosition.left}
        toggle={
          <DropdownToggle
            splitButtonItems={[
              <DropdownToggleCheckbox
                id="example-checkbox-2"
                key="split-checkbox"
                aria-label={anySelected ? 'Deselect all' : 'Select all'}
                isChecked={isChecked}
                onClick={() => {
                  anySelected ? this.handleSelectClick('none') : this.handleSelectClick('all');
                }}
              ></DropdownToggleCheckbox>
            ]}
            onToggle={this.onDropDownToggle}
          >
            {numSelected !== 0 && <React.Fragment>{numSelected} selected</React.Fragment>}
          </DropdownToggle>
        }
        isOpen={isDropDownOpen}
        dropdownItems={items}
      />
    );
  }

  renderToolbar() {
    return (
      <React.Fragment>
        <Toolbar>
          <ToolbarGroup>
            <ToolbarItem variant="bulk-select">{this.buildSelectDropdown()}</ToolbarItem>
            <ToolbarItem variant="pagination">{this.renderPagination('top')}</ToolbarItem>
          </ToolbarGroup>
        </Toolbar>
      </React.Fragment>
    );
  }

  render() {
    const { loading, res } = this.state;
    const rows = res.map(post => ({
      cells: [post.title, post.body],
      selected: post.selected
    }));

    return (
      <React.Fragment>
        {this.renderToolbar()}
        {!loading && (
          <Table
            aria-label="Bulk Select Table Demo"
            cells={['Title', 'Body']}
            rows={rows}
            onSelect={this.onSelect}
            canSelectAll={false}
          >
            <TableHeader />
            <TableBody />
          </Table>
        )}
        {loading && (
          <div className="pf-l-bullseye">
            <Title headingLevel="h2" size="3xl">
              Please wait while loading data
            </Title>
          </div>
        )}
        {this.renderPagination('bottom')}
      </React.Fragment>
    );
  }
}
```

### Expand/collapse all

```js
import React from 'react';
import { Table, TableHeader, TableBody, expandable } from '@patternfly/react-table';
import {
  Button,
  Checkbox,
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
  ToolbarExpandIconWrapper,
  ToolbarContent
} from '@patternfly/react-core';
import AngleDownIcon from '@patternfly/react-icons/dist/esm/icons/angle-down-icon';
import AngleRightIcon from '@patternfly/react-icons/dist/esm/icons/angle-right-icon';

class ExpandCollapseAllTableDemo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isChecked: false,
      selectedRows: 0,
      expandedRows: 0,
      expandCollapseToggle: 'expand',
      columns: [
        {
          title: 'Header cell',
          cellFormatters: [expandable]
        },
        'Branches',
        'Pull requests',
        'Workspaces',
        'Last Commit'
      ],
      rows: [
        {
          cells: ['one', 'two', 'three', 'four', 'five']
        },
        {
          isOpen: false,
          cells: ['parent - 1', 'two', 'three', 'four', 'five']
        },
        {
          parent: 1,
          cells: ['child - 1']
        },
        {
          isOpen: false,
          cells: ['parent - 2', 'two', 'three', 'four', 'five']
        },
        {
          parent: 3,
          cells: ['child - 2']
        },
        {
          isOpen: false,
          cells: ['parent - 3', 'two', 'three', 'four', 'five']
        },
        {
          parent: 5,
          cells: ['child - 3']
        }
      ]
    };
    this.onCollapse = this.onCollapse.bind(this);
    this.toggleCollapseAll = this.toggleCollapseAll.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.toggleSelectAll = this.toggleSelectAll.bind(this);
  }

  onCollapse(event, rowKey, isOpen) {
    const { rows, expandedRows, expandCollapseToggle } = this.state;
    const expandableRowLength = this.state.rows.filter(row => row.isOpen !== undefined).length;
    /**
     * Please do not use rowKey as row index for more complex tables.
     * Rather use some kind of identifier like ID passed with each row.
     */
    rows[rowKey].isOpen = isOpen;
    const updatedExpandedRows = isOpen ? expandedRows + 1 : expandedRows - 1;
    this.setState({
      rows,
      expandedRows: updatedExpandedRows,
      expandCollapseToggle:
        updatedExpandedRows === expandableRowLength
          ? 'collapse'
          : updatedExpandedRows === 0
          ? 'expand'
          : expandCollapseToggle
    });
  }

  toggleCollapseAll(collapse) {
    const expandableRowLength = this.state.rows.filter(row => row.isOpen !== undefined).length;
    const updatedRows = this.state.rows.map(row =>
      row.isOpen !== undefined
        ? {
            ...row,
            isOpen: !collapse
          }
        : row
    );
    this.setState({
      rows: updatedRows,
      expandedRows: collapse ? 0 : expandableRowLength,
      expandCollapseToggle: collapse === false ? 'collapse' : 'expand'
    });
  }

  onSelect(event, isSelected, rowId) {
    let isChecked = null;
    let selectedRows = this.state.selectedRows;
    const selectableRowLength = this.state.rows.filter(row => row.parent === undefined).length;
    let rows;
    if (rowId === -1) {
      rows = this.state.rows.map(row => {
        row.selected = isSelected;
        return row;
      });
      isChecked = isSelected;
      selectedRows = isSelected ? selectableRowLength : 0;
    } else {
      rows = [...this.state.rows];
      rows[rowId].selected = isSelected;
      selectedRows = isSelected ? selectedRows + 1 : selectedRows - 1;
      isChecked = selectedRows === 0 ? false : selectedRows === selectableRowLength ? true : null;
    }
    this.setState({
      rows,
      isChecked,
      selectedRows
    });
  }

  toggleSelectAll(checked) {
    this.onSelect(null, checked, -1);
  }

  render() {
    const { columns, rows, expandCollapseToggle, isChecked } = this.state;

    return (
      <React.Fragment>
        <Toolbar>
          <ToolbarContent>
            <ToolbarGroup variant="icon-button-group">
              <ToolbarItem variant="expand-all" isAllExpanded={expandCollapseToggle !== 'expand'}>
                {expandCollapseToggle === 'expand' ? (
                  <Button variant="plain" aria-label="Expand all" onClick={() => this.toggleCollapseAll(false)}>
                    <ToolbarExpandIconWrapper>
                      <AngleRightIcon />
                    </ToolbarExpandIconWrapper>
                  </Button>
                ) : (
                  <Button variant="plain" aria-label="Collapse all" onClick={() => this.toggleCollapseAll(true)}>
                    <ToolbarExpandIconWrapper>
                      <AngleRightIcon />
                    </ToolbarExpandIconWrapper>
                  </Button>
                )}
              </ToolbarItem>
              <ToolbarItem>
                <Checkbox
                  isChecked={isChecked}
                  onChange={this.toggleSelectAll}
                  aria-label="toggle select all checkbox"
                  id="toggle-select-all"
                  name="toggle-select-all"
                  label={isChecked ? 'Deselect all' : 'Select all'}
                />
              </ToolbarItem>
            </ToolbarGroup>
          </ToolbarContent>
        </Toolbar>
        <Table
          aria-label="Collapsible table"
          onSelect={this.onSelect}
          onCollapse={this.onCollapse}
          rows={rows}
          cells={columns}
          canSelectAll={false}
        >
          <TableHeader />
          <TableBody />
        </Table>
      </React.Fragment>
    );
  }
}
```

### Column management

```js
import React from 'react';
import {
  Button,
  Checkbox,
  DataList,
  DataListCheck,
  DataListItem,
  DataListItemRow,
  DataListCell,
  DataListItemCells,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  Modal,
  OverflowMenu,
  OverflowMenuGroup,
  OverflowMenuItem,
  OptionsMenu,
  OptionsMenuToggle,
  Pagination,
  PaginationVariant,
  Text,
  TextContent,
  ToolbarToggleGroup,
  Select,
  SelectVariant
} from '@patternfly/react-core';
import { Table, TableHeader, TableBody } from '@patternfly/react-table';
import CodeIcon from '@patternfly/react-icons/dist/esm/icons/code-icon';
import CodeBranchIcon from '@patternfly/react-icons/dist/esm/icons/code-branch-icon';
import CubeIcon from '@patternfly/react-icons/dist/esm/icons/cube-icon';
import FilterIcon from '@patternfly/react-icons/dist/esm/icons/filter-icon';
import SortAmountDownIcon from '@patternfly/react-icons/dist/esm/icons/sort-amount-down-icon';

class ColumnManagementAction extends React.Component {
  constructor(props) {
    super(props);
    this.actions = [
      {
        title: <a href="#">Link</a>
      },
      {
        title: 'Action'
      },
      {
        isSeparator: true
      },
      {
        title: <a href="#">Separated link</a>
      }
    ];
    this.defaultColumns = ['Repositories', 'Branches', 'Pull requests', 'Workspaces', 'Last commit', ''];
    this.defaultRows = [
      {
        cells: [
          {
            title: (
              <React.Fragment>
                <div>Node 1</div>
                <a href="#">siemur/test-space</a>
              </React.Fragment>
            ),
            props: { column: 'Repositories' }
          },
          {
            title: (
              <React.Fragment>
                <CodeBranchIcon key="icon" /> 10
              </React.Fragment>
            ),
            props: { column: 'Branches' }
          },
          {
            title: (
              <React.Fragment>
                <CodeIcon key="icon" /> 25
              </React.Fragment>
            ),
            props: { column: 'Pull requests' }
          },
          {
            title: (
              <React.Fragment>
                <CubeIcon key="icon" /> 5
              </React.Fragment>
            ),
            props: { column: 'Workspaces' }
          },
          {
            title: '2 days ago',
            props: { column: 'Last commit' }
          },
          {
            title: (
              <React.Fragment>
                <a href="#">Action link</a>
              </React.Fragment>
            ),
            props: { column: '' }
          }
        ]
      },
      {
        cells: [
          {
            title: (
              <React.Fragment>
                <div>Node 2</div>
                <a href="#">siemur/test-space</a>
              </React.Fragment>
            ),
            props: { column: 'Repositories' }
          },
          {
            title: (
              <React.Fragment>
                <CodeBranchIcon key="icon" /> 8
              </React.Fragment>
            ),
            props: { column: 'Branches' }
          },
          {
            title: (
              <React.Fragment>
                <CodeIcon key="icon" /> 30
              </React.Fragment>
            ),
            props: { column: 'Pull requests' }
          },
          {
            title: (
              <React.Fragment>
                <CubeIcon key="icon" /> 2
              </React.Fragment>
            ),
            props: { column: 'Workspaces' }
          },
          {
            title: '2 days ago',
            props: { column: 'Last commit' }
          },
          {
            title: (
              <React.Fragment>
                <a href="#">Action link</a>
              </React.Fragment>
            ),
            props: { column: '' }
          }
        ]
      },
      {
        cells: [
          {
            title: (
              <React.Fragment>
                <div>Node 3</div>
                <a href="#">siemur/test-space</a>
              </React.Fragment>
            ),
            props: { column: 'Repositories' }
          },
          {
            title: (
              <React.Fragment>
                <CodeBranchIcon key="icon" /> 12
              </React.Fragment>
            ),
            props: { column: 'Branches' }
          },
          {
            title: (
              <React.Fragment>
                <CodeIcon key="icon" /> 48
              </React.Fragment>
            ),
            props: { column: 'Pull requests' }
          },
          {
            title: (
              <React.Fragment>
                <CubeIcon key="icon" /> 13
              </React.Fragment>
            ),
            props: { column: 'Workspaces' }
          },
          {
            title: '30 days ago',
            props: { column: 'Last commit' }
          },
          {
            title: (
              <React.Fragment>
                <a href="#">Action link</a>
              </React.Fragment>
            ),
            props: { column: '' }
          }
        ]
      },
      {
        cells: [
          {
            title: (
              <React.Fragment>
                <div>Node 4</div>
                <a href="#">siemur/test-space</a>
              </React.Fragment>
            ),
            props: { column: 'Repositories' }
          },
          {
            title: (
              <React.Fragment>
                <CodeBranchIcon key="icon" /> 3
              </React.Fragment>
            ),
            props: { column: 'Branches' }
          },
          {
            title: (
              <React.Fragment>
                <CodeIcon key="icon" /> 8
              </React.Fragment>
            ),
            props: { column: 'Pull requests' }
          },
          {
            title: (
              <React.Fragment>
                <CubeIcon key="icon" /> 20
              </React.Fragment>
            ),
            props: { column: 'Workspaces' }
          },
          {
            title: '8 days ago',
            props: { column: 'Last commit' }
          },
          {
            title: (
              <React.Fragment>
                <a href="#">Action link</a>
              </React.Fragment>
            ),
            props: { column: '' }
          }
        ]
      },
      {
        cells: [
          {
            title: (
              <React.Fragment>
                <div>Node 5</div>
                <a href="#">siemur/test-space</a>
              </React.Fragment>
            ),
            props: { column: 'Repositories' }
          },
          {
            title: (
              <React.Fragment>
                <CodeBranchIcon key="icon" /> 34
              </React.Fragment>
            ),
            props: { column: 'Branches' }
          },
          {
            title: (
              <React.Fragment>
                <CodeIcon key="icon" /> 21
              </React.Fragment>
            ),
            props: { column: 'Pull requests' }
          },
          {
            title: (
              <React.Fragment>
                <CubeIcon key="icon" /> 26
              </React.Fragment>
            ),
            props: { column: 'Workspaces' }
          },
          {
            title: '2 days ago',
            props: { column: 'Last commit' }
          },
          {
            title: (
              <React.Fragment>
                <a href="#">Action link</a>
              </React.Fragment>
            ),
            props: { column: '' }
          }
        ]
      }
    ];
    this.state = {
      filters: [],
      filteredColumns: [],
      filteredRows: [],
      columns: this.defaultColumns,
      rows: this.defaultRows,
      canSelectAll: true,
      isModalOpen: false,
      check1: true,
      check2: true,
      check3: true,
      check4: true,
      check5: true
    };
    this.onSelect = this.onSelect.bind(this);
    this.toggleSelect = this.toggleSelect.bind(this);
    this.renderModal = this.renderModal.bind(this);
    this.matchCheckboxNameToColumn = name => {
      switch (name) {
        case 'check1':
          return 'Repositories';
        case 'check2':
          return 'Branches';
        case 'check3':
          return 'Pull requests';
        case 'check4':
          return 'Workspaces';
        case 'check5':
          return 'Last commit';
      }
    };
    this.filterData = (checked, name) => {
      const { rows, columns, filters } = this.state;
      if (checked) {
        const updatedFilters = filters.filter(item => item !== name);
        const filteredColumns = this.defaultColumns.filter(column => !updatedFilters.includes(column));
        const filteredRows = this.defaultRows.map(({ ...row }) => {
          row.cells = row.cells.filter(cell => !updatedFilters.includes(cell.props.column));
          return row;
        });
        this.setState({
          filters: updatedFilters,
          filteredColumns: filteredColumns,
          filteredRows: filteredRows
        });
      } else {
        let updatedFilters = filters;
        updatedFilters.push(name);
        const filteredColumns = columns.filter(column => !filters.includes(column));
        const filteredRows = rows.map(({ ...row }) => {
          row.cells = row.cells.filter(cell => !filters.includes(cell.props.column));
          return row;
        });
        this.setState({
          filters: updatedFilters,
          filteredColumns: filteredColumns,
          filteredRows: filteredRows
        });
      }
    };
    this.unfilterAllData = () => {
      this.setState({
        filters: [],
        filteredColumns: this.defaultColumns,
        filteredRows: this.defaultRows
      });
    };
    this.handleChange = (checked, event) => {
      const target = event.target;
      const value = target.type === 'checkbox' ? target.checked : target.value;
      this.filterData(checked, this.matchCheckboxNameToColumn(target.name));
      this.setState({
        [target.name]: value
      });
    };
    this.handleModalToggle = () => {
      this.setState(({ isModalOpen }) => ({
        isModalOpen: !isModalOpen
      }));
    };
    this.onSave = () => {
      this.setState(({ filteredColumns, filteredRows, isModalOpen }) => ({
        columns: filteredColumns,
        rows: filteredRows,
        isModalOpen: !isModalOpen
      }));
    };
    this.selectAllColumns = () => {
      this.unfilterAllData();
      this.setState({
        check1: true,
        check2: true,
        check3: true,
        check4: true,
        check5: true
      });
    };
  }

  onSelect(event, isSelected, rowId) {
    let rows;
    if (rowId === -1) {
      rows = this.state.rows.map(oneRow => {
        oneRow.selected = isSelected;
        return oneRow;
      });
    } else {
      rows = [...this.state.rows];
      rows[rowId].selected = isSelected;
    }
    this.setState({
      rows
    });
  }

  toggleSelect(checked) {
    this.setState({
      canSelectAll: checked
    });
  }

  renderModal() {
    const { isModalOpen } = this.state;
    return (
      <Modal
        title="Manage columns"
        isOpen={isModalOpen}
        variant="small"
        description={
          <TextContent>
            <Text component={TextVariants.p}>Selected categories will be displayed in the table.</Text>
            <Button isInline onClick={this.selectAllColumns} variant="link">
              Select all
            </Button>
          </TextContent>
        }
        onClose={this.handleModalToggle}
        actions={[
          <Button key="save" variant="primary" onClick={this.onSave}>
            Save
          </Button>,
          <Button key="cancel" variant="secondary" onClick={this.handleModalToggle}>
            Cancel
          </Button>
        ]}
      >
        <DataList aria-label="Table column management" id="table-column-management" isCompact>
          <DataListItem aria-labelledby="table-column-management-item1">
            <DataListItemRow>
              <DataListCheck
                aria-labelledby="table-column-management-item1"
                checked={this.state.check1}
                name="check1"
                id="check1"
                onChange={this.handleChange}
              />
              <DataListItemCells
                dataListCells={[
                  <DataListCell id="table-column-management-item1" key="table-column-management-item1">
                    <label htmlFor="check1">
                      Repositories
                    </label>
                  </DataListCell>
                ]}
              />
            </DataListItemRow>
          </DataListItem>
          <DataListItem aria-labelledby="table-column-management-item2">
            <DataListItemRow>
              <DataListCheck
                aria-labelledby="table-column-management-item2"
                checked={this.state.check2}
                name="check2"
                id="check2"
                onChange={this.handleChange}
              />
              <DataListItemCells
                dataListCells={[
                  <DataListCell id="table-column-management-item2" key="table-column-management-item2">
                    <label htmlFor="check2">
                      Branches
                    </label>
                  </DataListCell>
                ]}
              />
          </DataListItemRow>
          </DataListItem>
          <DataListItem aria-labelledby="table-column-management-item3">
            <DataListItemRow>
              <DataListCheck
                aria-labelledby="table-column-management-item3"
                checked={this.state.check3}
                name="check3"
                id="check3"
                onChange={this.handleChange}
              />
              <DataListItemCells
                dataListCells={[
                  <DataListCell id="table-column-management-item3" key="table-column-management-item3">
                    <label htmlFor="check3">
                      Pull requests
                    </label>            
                  </DataListCell>
                ]}
              />
            </DataListItemRow>
          </DataListItem>
          <DataListItem aria-labelledby="table-column-management-item4">
            <DataListItemRow>
              <DataListCheck
                aria-labelledby="table-column-management-item4"
                checked={this.state.check4}
                name="check4"
                id="check4"
                onChange={this.handleChange}
              />
              <DataListItemCells
                dataListCells={[
                  <DataListCell id="table-column-management-item4" key="table-column-management-item4">
                    <label htmlFor="check4">
                      Workspaces
                    </label>
                  </DataListCell>
                ]}
              />
            </DataListItemRow>
          </DataListItem>
          <DataListItem aria-labelledby="table-column-management-item5">
            <DataListItemRow>
              <DataListCheck
                aria-labelledby="table-column-management-item5"
                checked={this.state.check5}
                name="check5"
                id="check5"
                onChange={this.handleChange}
              />
              <DataListItemCells
                dataListCells={[
                    <DataListCell id="table-column-management-item5" key="table-column-management-item5">
                      <label htmlFor="check5">
                        Last commit
                      </label>
                    </DataListCell>
                ]}
              />
            </DataListItemRow>
          </DataListItem>
        </DataList>
      </Modal>
    );
  }

  render() {
    const { canSelectAll, columns, rows } = this.state;

    const toolbarItems = (
      <React.Fragment>
        <span id="page-layout-table-column-management-action-toolbar-top-select-checkbox-label" hidden>
          Choose one
        </span>
        <ToolbarContent>
          <ToolbarItem variant="overflow-menu">
            <OverflowMenu breakpoint="md">
              <OverflowMenuItem isPersistent>
                <Select
                  id="page-layout-table-column-management-action-toolbar-top-select-checkbox-toggle"
                  variant={SelectVariant.single}
                  aria-label="Select Input"
                  aria-labelledby="page-layout-table-column-management-action-toolbar-top-select-checkbox-label page-layout-table-column-management-action-toolbar-top-select-checkbox-toggle"
                  placeholderText={
                    <>
                      <FilterIcon /> Name
                    </>
                  }
                />
              </OverflowMenuItem>
              <OverflowMenuItem>
                <OptionsMenu
                  id="page-layout-table-column-management-action-toolbar-top-options-menu-toggle"
                  isPlain
                  menuItems={[]}
                  toggle={
                    <OptionsMenuToggle
                      toggleTemplate={<SortAmountDownIcon aria-hidden="true" />}
                      aria-label="Sort by"
                      hideCaret
                    />
                  }
                />
              </OverflowMenuItem>
              <OverflowMenuGroup groupType="button" isPersistent>
                <OverflowMenuItem>
                  <Button variant="primary">Action</Button>
                </OverflowMenuItem>
                <OverflowMenuItem>
                  <Button variant="link" onClick={this.handleModalToggle}>
                    Manage columns
                  </Button>
                </OverflowMenuItem>
              </OverflowMenuGroup>
            </OverflowMenu>
          </ToolbarItem>
          <ToolbarItem variant="pagination">
            <Pagination
              itemCount={37}
              widgetId="pagination-options-menu-bottom"
              page={1}
              variant={PaginationVariant.top}
              isCompact
            />
          </ToolbarItem>
        </ToolbarContent>
      </React.Fragment>
    );

    return (
      <React.Fragment>
        <Table
          gridBreakPoint="grid-xl"
          header={
            <React.Fragment>
              <Toolbar id="page-layout-table-column-management-action-toolbar-top">{toolbarItems}</Toolbar>
            </React.Fragment>
          }
          aria-label="This is a table with checkboxes"
          id="page-layout-table-column-management-action-table"
          onSelect={this.onSelect}
          cells={columns}
          rows={rows}
          actions={this.actions}
          canSelectAll={canSelectAll}
        >
          <TableHeader />
          <TableBody />
        </Table>
        <Pagination
          isCompact
          id="page-layout-table-column-management-action-toolbar-bottom"
          itemCount={37}
          widgetId="pagination-options-menu-bottom"
          page={1}
          variant={PaginationVariant.bottom}
        />
        {this.renderModal()}
      </React.Fragment>
    );
  }
}
```

### Column management with draggable

```js
import React from 'react';
import {
  Button,
  Checkbox,
  DataList,
  DataListCheck,
  DataListControl,
  DataListDragButton,
  DataListItem,
  DataListItemRow,
  DataListCell,
  DataListItemCells,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  Modal,
  OverflowMenu,
  OverflowMenuGroup,
  OverflowMenuItem,
  OptionsMenu,
  OptionsMenuToggle,
  Pagination,
  PaginationVariant,
  Text,
  TextContent,
  ToolbarToggleGroup,
  Select,
  SelectVariant
} from '@patternfly/react-core';
import { Table, TableHeader, TableBody } from '@patternfly/react-table';
import CodeIcon from '@patternfly/react-icons/dist/esm/icons/code-icon';
import CodeBranchIcon from '@patternfly/react-icons/dist/esm/icons/code-branch-icon';
import CubeIcon from '@patternfly/react-icons/dist/esm/icons/cube-icon';
import FilterIcon from '@patternfly/react-icons/dist/esm/icons/filter-icon';
import SortAmountDownIcon from '@patternfly/react-icons/dist/esm/icons/sort-amount-down-icon';

class ColumnManagementAction extends React.Component {
  constructor(props) {
    super(props);
    this.actions = [
      {
        title: <a href="#">Link</a>
      },
      {
        title: 'Action'
      },
      {
        isSeparator: true
      },
      {
        title: <a href="#">Separated link</a>
      }
    ];
    this.defaultColumns = ['Repositories', 'Branches', 'Pull requests', 'Workspaces', 'Last commit', ''];
    this.defaultRows = [
      {
        cells: [
          {
            title: (
              <React.Fragment>
                <div>Node 1</div>
                <a href="#">siemur/test-space</a>
              </React.Fragment>
            ),
            props: { column: 'Repositories' }
          },
          {
            title: (
              <React.Fragment>
                <CodeBranchIcon key="icon" /> 10
              </React.Fragment>
            ),
            props: { column: 'Branches' }
          },
          {
            title: (
              <React.Fragment>
                <CodeIcon key="icon" /> 25
              </React.Fragment>
            ),
            props: { column: 'Pull requests' }
          },
          {
            title: (
              <React.Fragment>
                <CubeIcon key="icon" /> 5
              </React.Fragment>
            ),
            props: { column: 'Workspaces' }
          },
          {
            title: '2 days ago',
            props: { column: 'Last commit' }
          },
          {
            title: (
              <React.Fragment>
                <a href="#">Action link</a>
              </React.Fragment>
            ),
            props: { column: '' }
          }
        ]
      },
      {
        cells: [
          {
            title: (
              <React.Fragment>
                <div>Node 2</div>
                <a href="#">siemur/test-space</a>
              </React.Fragment>
            ),
            props: { column: 'Repositories' }
          },
          {
            title: (
              <React.Fragment>
                <CodeBranchIcon key="icon" /> 8
              </React.Fragment>
            ),
            props: { column: 'Branches' }
          },
          {
            title: (
              <React.Fragment>
                <CodeIcon key="icon" /> 30
              </React.Fragment>
            ),
            props: { column: 'Pull requests' }
          },
          {
            title: (
              <React.Fragment>
                <CubeIcon key="icon" /> 2
              </React.Fragment>
            ),
            props: { column: 'Workspaces' }
          },
          {
            title: '2 days ago',
            props: { column: 'Last commit' }
          },
          {
            title: (
              <React.Fragment>
                <a href="#">Action link</a>
              </React.Fragment>
            ),
            props: { column: '' }
          }
        ]
      },
      {
        cells: [
          {
            title: (
              <React.Fragment>
                <div>Node 3</div>
                <a href="#">siemur/test-space</a>
              </React.Fragment>
            ),
            props: { column: 'Repositories' }
          },
          {
            title: (
              <React.Fragment>
                <CodeBranchIcon key="icon" /> 12
              </React.Fragment>
            ),
            props: { column: 'Branches' }
          },
          {
            title: (
              <React.Fragment>
                <CodeIcon key="icon" /> 48
              </React.Fragment>
            ),
            props: { column: 'Pull requests' }
          },
          {
            title: (
              <React.Fragment>
                <CubeIcon key="icon" /> 13
              </React.Fragment>
            ),
            props: { column: 'Workspaces' }
          },
          {
            title: '30 days ago',
            props: { column: 'Last commit' }
          },
          {
            title: (
              <React.Fragment>
                <a href="#">Action link</a>
              </React.Fragment>
            ),
            props: { column: '' }
          }
        ]
      },
      {
        cells: [
          {
            title: (
              <React.Fragment>
                <div>Node 4</div>
                <a href="#">siemur/test-space</a>
              </React.Fragment>
            ),
            props: { column: 'Repositories' }
          },
          {
            title: (
              <React.Fragment>
                <CodeBranchIcon key="icon" /> 3
              </React.Fragment>
            ),
            props: { column: 'Branches' }
          },
          {
            title: (
              <React.Fragment>
                <CodeIcon key="icon" /> 8
              </React.Fragment>
            ),
            props: { column: 'Pull requests' }
          },
          {
            title: (
              <React.Fragment>
                <CubeIcon key="icon" /> 20
              </React.Fragment>
            ),
            props: { column: 'Workspaces' }
          },
          {
            title: '8 days ago',
            props: { column: 'Last commit' }
          },
          {
            title: (
              <React.Fragment>
                <a href="#">Action link</a>
              </React.Fragment>
            ),
            props: { column: '' }
          }
        ]
      },
      {
        cells: [
          {
            title: (
              <React.Fragment>
                <div>Node 5</div>
                <a href="#">siemur/test-space</a>
              </React.Fragment>
            ),
            props: { column: 'Repositories' }
          },
          {
            title: (
              <React.Fragment>
                <CodeBranchIcon key="icon" /> 34
              </React.Fragment>
            ),
            props: { column: 'Branches' }
          },
          {
            title: (
              <React.Fragment>
                <CodeIcon key="icon" /> 21
              </React.Fragment>
            ),
            props: { column: 'Pull requests' }
          },
          {
            title: (
              <React.Fragment>
                <CubeIcon key="icon" /> 26
              </React.Fragment>
            ),
            props: { column: 'Workspaces' }
          },
          {
            title: '2 days ago',
            props: { column: 'Last commit' }
          },
          {
            title: (
              <React.Fragment>
                <a href="#">Action link</a>
              </React.Fragment>
            ),
            props: { column: '' }
          }
        ]
      }
    ];
    this.state = {
      filters: [],
      filteredColumns: [],
      filteredRows: [],
      columns: this.defaultColumns,
      rows: this.defaultRows,
      canSelectAll: true,
      isModalOpen: false,
      check1: true,
      check2: true,
      check3: true,
      check4: true,
      check5: true,
      liveText: '',
      id: '', 
      itemOrder: ['data1', 'data2', 'data3', 'data4', 'data5']
    };
    this.onSelect = this.onSelect.bind(this);
    this.toggleSelect = this.toggleSelect.bind(this);
    this.renderModal = this.renderModal.bind(this);
    this.matchCheckboxNameToColumn = name => {
      switch (name) {
        case 'check1':
          return 'Repositories';
        case 'check2':
          return 'Branches';
        case 'check3':
          return 'Pull requests';
        case 'check4':
          return 'Workspaces';
        case 'check5':
          return 'Last commit';
      }
    };
    this.matchDataListNameToColumn = name => {
      switch (name) {
        case 'data1':
          return 'Repositories';
        case 'data2':
          return 'Branches';
        case 'data3':
          return 'Pull requests';
        case 'data4':
          return 'Workspaces';
        case 'data5':
          return 'Last commit';
      }
    };
    this.filterData = (checked, name) => {
      const { rows, columns, filters } = this.state;
      if (checked) {
        const updatedFilters = filters.filter(item => item !== name);
        const filteredColumns = this.defaultColumns.filter(column => !updatedFilters.includes(column));
        const filteredRows = this.defaultRows.map(({ ...row }) => {
          row.cells = row.cells.filter(cell => !updatedFilters.includes(cell.props.column));
          return row;
        });
        this.setState({
          filters: updatedFilters,
          filteredColumns: filteredColumns,
          filteredRows: filteredRows
        });
      } else {
        let updatedFilters = filters;
        updatedFilters.push(name);
        const filteredColumns = columns.filter(column => !filters.includes(column));
        const filteredRows = rows.map(({ ...row }) => {
          row.cells = row.cells.filter(cell => !filters.includes(cell.props.column));
          return row;
        });
        this.setState({
          filters: updatedFilters,
          filteredColumns: filteredColumns,
          filteredRows: filteredRows
        });
      }
    };
    this.unfilterAllData = () => {
      this.setState({
        filters: [],
        filteredColumns: this.defaultColumns,
        filteredRows: this.defaultRows
      });
    };
    this.handleChange = (checked, event) => {
      const target = event.target;
      const value = target.type === 'checkbox' ? target.checked : target.value;
      this.filterData(checked, this.matchCheckboxNameToColumn(target.name));
      this.setState({
        [target.name]: value
      });

    };
    this.handleModalToggle = () => {
      this.setState(({ isModalOpen }) => ({
        isModalOpen: !isModalOpen
      }));
    };
    this.onSave = () => {
      const orderedColumns = this.state.itemOrder.map(item => this.matchDataListNameToColumn(item));
      // concat empty string at the end for actions column
      const filteredOrderedColumns = orderedColumns.filter(col => this.state.filteredColumns.indexOf(col) > -1).concat(['']);
      const orderedRows = [];
      this.state.filteredRows.forEach(row => {
        const updatedCells = row.cells.sort((cellA, cellB) => {
          const indexA = filteredOrderedColumns.indexOf(cellA.props.column);
          const indexB = filteredOrderedColumns.indexOf(cellB.props.column);
          if (indexA < indexB) {
            return -1;
          }
          if (indexA > indexB) {
            return 1;
          }
          // a must be equal to b
          return 0;
        });
        orderedRows.push({
          cells: updatedCells
        });
      });
      this.setState(({ filteredColumns, filteredRows, isModalOpen }) => ({
        columns: filteredOrderedColumns,
        rows: orderedRows,
        isModalOpen: !isModalOpen
      }));
    };
    this.selectAllColumns = () => {
      this.unfilterAllData();
      this.setState({
        check1: true,
        check2: true,
        check3: true,
        check4: true,
        check5: true
      });
    };

    this.onDragStart = id => {
      this.setState({
        id: id,
        liveText: `Dragging started for item id: ${id}.`
      });
    };

    this.onDragMove = (oldIndex, newIndex) => {
      const { id } = this.state;
      this.setState({
        liveText: `Dragging item ${id}.`
      });
    };

    this.onDragCancel = () => {
      this.setState({
        liveText: `Dragging cancelled. List is unchanged.`
      });
    };

    this.onDragFinish = itemOrder => {
      this.setState({
        liveText: `Dragging finished`,
        itemOrder
      });
    };
  }

  onSelect(event, isSelected, rowId) {
    let rows;
    if (rowId === -1) {
      rows = this.state.rows.map(oneRow => {
        oneRow.selected = isSelected;
        return oneRow;
      });
    } else {
      rows = [...this.state.rows];
      rows[rowId].selected = isSelected;
    }
    this.setState({
      rows
    });
  }

  toggleSelect(checked) {
    this.setState({
      canSelectAll: checked
    });
  }
  
  renderModal() {
    const { isModalOpen } = this.state;
    return (
      <Modal
        title="Manage columns"
        isOpen={isModalOpen}
        variant="small"
        description={
          <TextContent>
            <Text component={TextVariants.p}>Selected categories will be displayed in the table.</Text>
            <Button isInline onClick={this.selectAllColumns} variant="link">
              Select all
            </Button>
          </TextContent>
        }
        onClose={this.handleModalToggle}
        actions={[
          <Button key="save" variant="primary" onClick={this.onSave}>
            Save
          </Button>,
          <Button key="cancel" variant="secondary" onClick={this.handleModalToggle}>
            Cancel
          </Button>
        ]}
      >
        <DataList 
          aria-label="Table column management"
          id="table-column-management"
          isCompact
          onDragFinish={this.onDragFinish}
          onDragStart={this.onDragStart}
          onDragMove={this.onDragMove}
          onDragCancel={this.onDragCancel}
          itemOrder={this.state.itemOrder}
        >
          <DataListItem aria-labelledby="table-column-management-item1" id="data1">
            <DataListItemRow>
              <DataListControl>
                  <DataListDragButton
                    aria-label="Reorder"
                    aria-labelledby="table-column-management-item1"
                    aria-describedby="Press space or enter to begin dragging, and use the arrow keys to navigate up or down. Press enter to confirm the drag, or any other key to cancel the drag operation."
                    aria-pressed="false"
                  />
                  <DataListCheck
                    aria-labelledby="table-column-management-item1"
                    checked={this.state.check1}
                    name="check1"
                    id="check1"
                    onChange={this.handleChange}
                    otherControls
                  />
                </DataListControl>
              <DataListItemCells
                dataListCells={[
                  <DataListCell id="table-column-management-item1" key="table-column-management-item1">
                    <label htmlFor="check1">                  
                      Repositories
                    </label>
                  </DataListCell>
                ]}
              />
            </DataListItemRow>
          </DataListItem>
          <DataListItem aria-labelledby="table-column-management-item2" id="data2">
            <DataListItemRow>
             <DataListControl>
              <DataListDragButton
                aria-label="Reorder"
                aria-labelledby="table-column-management-item2"
                aria-describedby="Press space or enter to begin dragging, and use the arrow keys to navigate up or down. Press enter to confirm the drag, or any other key to cancel the drag operation."
                aria-pressed="false"
              />
              <DataListCheck
                aria-labelledby="table-column-management-item2"
                checked={this.state.check2}
                name="check2"
                id="check2"
                onChange={this.handleChange}
                otherControls
              />
              </DataListControl>
              <DataListItemCells
                dataListCells={[
                  <DataListCell id="table-column-management-item2" key="table-column-management-item2">
                    <label htmlFor="check2">
                      Branches
                    </label>
                  </DataListCell>
                ]}
              />
          </DataListItemRow>
          </DataListItem>
          <DataListItem aria-labelledby="table-column-management-item3" id="data3">
            <DataListItemRow>
              <DataListControl>
                  <DataListDragButton
                    aria-label="Reorder"
                    aria-labelledby="table-column-management-item3"
                    aria-describedby="Press space or enter to begin dragging, and use the arrow keys to navigate up or down. Press enter to confirm the drag, or any other key to cancel the drag operation."
                    aria-pressed="false"
                  />
              <DataListCheck
                aria-labelledby="table-column-management-item3"
                checked={this.state.check3}
                name="check3"
                id="check3"
                onChange={this.handleChange}
                otherControls
              />
              </DataListControl>
              <DataListItemCells
                dataListCells={[
                    <DataListCell id="table-column-management-item3" key="table-column-management-item3">
                      <label htmlFor="check3">
                        Pull requests
                      </label>            
                    </DataListCell>
                ]}
              />
            </DataListItemRow>
          </DataListItem>
          <DataListItem aria-labelledby="table-column-management-item4" id="data4">
            <DataListItemRow>
              <DataListControl>
                <DataListDragButton
                  aria-label="Reorder"
                  aria-labelledby="table-column-management-item4"
                  aria-describedby="Press space or enter to begin dragging, and use the arrow keys to navigate up or down. Press enter to confirm the drag, or any other key to cancel the drag operation."
                  aria-pressed="false"
                />
              <DataListCheck
                aria-labelledby="table-column-management-item4"
                checked={this.state.check4}
                name="check4"
                id="check4"
                onChange={this.handleChange}
                otherControls
              />
              </DataListControl>
              <DataListItemCells
                dataListCells={[
                  <DataListCell id="table-column-management-item4" key="table-column-management-item4">
                    <label htmlFor="check4">
                      Workspaces
                    </label>
                  </DataListCell>
                ]}
              />
            </DataListItemRow>
          </DataListItem>
          <DataListItem aria-labelledby="table-column-management-item5" id="data5">
            <DataListItemRow>
              <DataListControl>
                <DataListDragButton
                  aria-label="Reorder"
                  aria-labelledby="table-column-management-item5"
                  aria-describedby="Press space or enter to begin dragging, and use the arrow keys to navigate up or down. Press enter to confirm the drag, or any other key to cancel the drag operation."
                  aria-pressed="false"
                />
              <DataListCheck
                aria-labelledby="table-column-management-item5"
                checked={this.state.check5}
                name="check5"
                id="check5"
                onChange={this.handleChange}
                otherControls
              />
              </DataListControl>
              <DataListItemCells
                dataListCells={[
                  <DataListCell id="table-column-management-item5" key="table-column-management-item5">
                    <label htmlFor="check5">
                      Last commit
                    </label>
                  </DataListCell>
                ]}
              />
            </DataListItemRow>
          </DataListItem>
        </DataList>
      </Modal>
    );
  }

  render() {
    const { canSelectAll, columns, rows } = this.state;

    const toolbarItems = (
      <React.Fragment>
        <span id="page-layout-table-column-management-action-toolbar-top-select-checkbox-label" hidden>
          Choose one
        </span>
        <ToolbarContent>
          <ToolbarItem variant="overflow-menu">
            <OverflowMenu breakpoint="md">
              <OverflowMenuItem isPersistent>
                <Select
                  id="page-layout-table-column-management-action-toolbar-top-select-checkbox-toggle"
                  variant={SelectVariant.single}
                  aria-label="Select Input"
                  aria-labelledby="page-layout-table-column-management-action-toolbar-top-select-checkbox-label page-layout-table-column-management-action-toolbar-top-select-checkbox-toggle"
                  placeholderText={
                    <>
                      <FilterIcon /> Name
                    </>
                  }
                />
              </OverflowMenuItem>
              <OverflowMenuItem>
                <OptionsMenu
                  id="page-layout-table-column-management-action-toolbar-top-options-menu-toggle"
                  isPlain
                  menuItems={[]}
                  toggle={
                    <OptionsMenuToggle
                      toggleTemplate={<SortAmountDownIcon aria-hidden="true" />}
                      aria-label="Sort by"
                      hideCaret
                    />
                  }
                />
              </OverflowMenuItem>
              <OverflowMenuGroup groupType="button" isPersistent>
                <OverflowMenuItem>
                  <Button variant="primary">Action</Button>
                </OverflowMenuItem>
                <OverflowMenuItem>
                  <Button variant="link" onClick={this.handleModalToggle}>
                    Manage columns
                  </Button>
                </OverflowMenuItem>
              </OverflowMenuGroup>
            </OverflowMenu>
          </ToolbarItem>
          <ToolbarItem variant="pagination">
            <Pagination
              itemCount={37}
              widgetId="pagination-options-menu-bottom"
              page={1}
              variant={PaginationVariant.top}
              isCompact
            />
          </ToolbarItem>
        </ToolbarContent>
      </React.Fragment>
    );

    return (
      <React.Fragment>
        <Table
          gridBreakPoint="grid-xl"
          header={
            <React.Fragment>
              <Toolbar id="page-layout-table-column-management-action-toolbar-top">{toolbarItems}</Toolbar>
            </React.Fragment>
          }
          aria-label="This is a table with checkboxes"
          id="page-layout-table-column-management-action-table"
          onSelect={this.onSelect}
          cells={columns}
          rows={rows}
          actions={this.actions}
          canSelectAll={canSelectAll}
        >
          <TableHeader />
          <TableBody />
        </Table>
        <Pagination
          isCompact
          id="page-layout-table-column-management-action-toolbar-bottom"
          itemCount={37}
          widgetId="pagination-options-menu-bottom"
          page={1}
          variant={PaginationVariant.bottom}
        />
        {this.renderModal()}
      </React.Fragment>
    );
  }
}
```

### Filterable

```js
import React from 'react';
import {
  Button,
  ButtonVariant,
  Bullseye,
  Toolbar,
  ToolbarItem,
  ToolbarContent,
  ToolbarFilter,
  ToolbarToggleGroup,
  ToolbarGroup,
  Dropdown,
  DropdownItem,
  DropdownPosition,
  DropdownToggle,
  InputGroup,
  Title,
  Select,
  SelectOption,
  SelectVariant,
  TextInput,
  EmptyState,
  EmptyStateIcon,
  EmptyStateBody,
  EmptyStateSecondaryActions
} from '@patternfly/react-core';
import SearchIcon from '@patternfly/react-icons/dist/esm/icons/search-icon';
import FilterIcon from '@patternfly/react-icons/dist/esm/icons/filter-icon';
import { Table, TableHeader, TableBody } from '@patternfly/react-table';

class FilterTableDemo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filters: {
        location: [],
        name: [],
        status: []
      },
      currentCategory: 'Status',
      isFilterDropdownOpen: false,
      isCategoryDropdownOpen: false,
      nameInput: '',
      columns: [
        { title: 'Servers' },
        { title: 'Threads' },
        { title: 'Applications' },
        { title: 'Workspaces' },
        { title: 'Status' },
        { title: 'Location' }
      ],
      rows: [
        { cells: ['US-Node 1', '5', '25', '5', 'Stopped', 'Raleigh'] },
        { cells: ['US-Node 2', '5', '30', '2', 'Down', 'Westford'] },
        { cells: ['US-Node 3', '13', '35', '12', 'Degraded', 'Boston'] },
        { cells: ['US-Node 4', '2', '5', '18', 'Needs Maintainence', 'Raleigh'] },
        { cells: ['US-Node 5', '7', '30', '5', 'Running', 'Boston'] },
        { cells: ['US-Node 6', '5', '20', '15', 'Stopped', 'Raleigh'] },
        { cells: ['CZ-Node 1', '12', '48', '13', 'Down', 'Brno'] },
        { cells: ['CZ-Node 2', '3', '8', '20', 'Running', 'Brno'] },
        { cells: ['CZ-Remote-Node 1', '15', '20', '10', 'Down', 'Brno'] },
        { cells: ['Bangalore-Node 1', '20', '30', '30', 'Running', 'Bangalore'] }
      ],
      inputValue: ''
    };

    this.onDelete = (type = '', id = '') => {
      if (type) {
        this.setState(prevState => {
          prevState.filters[type.toLowerCase()] = prevState.filters[type.toLowerCase()].filter(s => s !== id);
          return {
            filters: prevState.filters
          };
        });
      } else {
        this.setState({
          filters: {
            location: [],
            name: [],
            status: []
          }
        });
      }
    };

    this.onCategoryToggle = isOpen => {
      this.setState({
        isCategoryDropdownOpen: isOpen
      });
    };

    this.onCategorySelect = event => {
      this.setState({
        currentCategory: event.target.innerText,
        isCategoryDropdownOpen: !this.state.isCategoryDropdownOpen
      });
    };

    this.onFilterToggle = isOpen => {
      this.setState({
        isFilterDropdownOpen: isOpen
      });
    };

    this.onFilterSelect = event => {
      this.setState({
        isFilterDropdownOpen: !this.state.isFilterDropdownOpen
      });
    };

    this.onInputChange = newValue => {
      this.setState({ inputValue: newValue });
    };

    this.onRowSelect = (event, isSelected, rowId) => {
      let rows;
      if (rowId === -1) {
        rows = this.state.rows.map(oneRow => {
          oneRow.selected = isSelected;
          return oneRow;
        });
      } else {
        rows = [...this.state.rows];
        rows[rowId].selected = isSelected;
      }
      this.setState({
        rows
      });
    };

    this.onStatusSelect = (event, selection) => {
      const checked = event.target.checked;
      this.setState(prevState => {
        const prevSelections = prevState.filters['status'];
        return {
          filters: {
            ...prevState.filters,
            status: checked ? [...prevSelections, selection] : prevSelections.filter(value => value !== selection)
          }
        };
      });
    };

    this.onNameInput = event => {
      if (event.key && event.key !== 'Enter') {
        return;
      }

      const { inputValue } = this.state;
      this.setState(prevState => {
        const prevFilters = prevState.filters['name'];
        return {
          filters: {
            ...prevState.filters,
            ['name']: prevFilters.includes(inputValue) ? prevFilters : [...prevFilters, inputValue]
          },
          inputValue: ''
        };
      });
    };

    this.onLocationSelect = (event, selection) => {
      this.setState(prevState => {
        return {
          filters: {
            ...prevState.filters,
            ['location']: [selection]
          }
        };
      });
      this.onFilterSelect();
    };
  }

  buildCategoryDropdown() {
    const { isCategoryDropdownOpen, currentCategory } = this.state;

    return (
      <ToolbarItem>
        <Dropdown
          onSelect={this.onCategorySelect}
          position={DropdownPosition.left}
          toggle={
            <DropdownToggle onToggle={this.onCategoryToggle} style={{ width: '100%' }}>
              <FilterIcon /> {currentCategory}
            </DropdownToggle>
          }
          isOpen={isCategoryDropdownOpen}
          dropdownItems={[
            <DropdownItem key="cat1">Location</DropdownItem>,
            <DropdownItem key="cat2">Name</DropdownItem>,
            <DropdownItem key="cat3">Status</DropdownItem>
          ]}
          style={{ width: '100%' }}
        ></Dropdown>
      </ToolbarItem>
    );
  }

  buildFilterDropdown() {
    const { currentCategory, isFilterDropdownOpen, inputValue, filters } = this.state;

    const locationMenuItems = [
      <SelectOption key="raleigh" value="Raleigh" />,
      <SelectOption key="westford" value="Westford" />,
      <SelectOption key="boston" value="Boston" />,
      <SelectOption key="brno" value="Brno" />,
      <SelectOption key="bangalore" value="Bangalore" />
    ];

    const statusMenuItems = [
      <SelectOption key="statusRunning" value="Running" />,
      <SelectOption key="statusStopped" value="Stopped" />,
      <SelectOption key="statusDown" value="Down" />,
      <SelectOption key="statusDegraded" value="Degraded" />,
      <SelectOption key="statusMaint" value="Needs Maintainence" />
    ];

    return (
      <React.Fragment>
        <ToolbarFilter
          chips={filters.location}
          deleteChip={this.onDelete}
          categoryName="Location"
          showToolbarItem={currentCategory === 'Location'}
        >
          <Select
            aria-label="Location"
            onToggle={this.onFilterToggle}
            onSelect={this.onLocationSelect}
            selections={filters.location[0]}
            isOpen={isFilterDropdownOpen}
            placeholderText="Any"
          >
            {locationMenuItems}
          </Select>
        </ToolbarFilter>
        <ToolbarFilter
          chips={filters.name}
          deleteChip={this.onDelete}
          categoryName="Name"
          showToolbarItem={currentCategory === 'Name'}
        >
          <InputGroup>
            <TextInput
              name="nameInput"
              id="nameInput1"
              type="search"
              aria-label="name filter"
              onChange={this.onInputChange}
              value={inputValue}
              placeholder="Filter by name..."
              onKeyDown={this.onNameInput}
            />
            <Button
              variant={ButtonVariant.control}
              aria-label="search button for search input"
              onClick={this.onNameInput}
            >
              <SearchIcon />
            </Button>
          </InputGroup>
        </ToolbarFilter>
        <ToolbarFilter
          chips={filters.status}
          deleteChip={this.onDelete}
          categoryName="Status"
          showToolbarItem={currentCategory === 'Status'}
        >
          <Select
            variant={SelectVariant.checkbox}
            aria-label="Status"
            onToggle={this.onFilterToggle}
            onSelect={this.onStatusSelect}
            selections={filters.status}
            isOpen={isFilterDropdownOpen}
            placeholderText="Filter by status"
          >
            {statusMenuItems}
          </Select>
        </ToolbarFilter>
      </React.Fragment>
    );
  }

  renderToolbar() {
    const { filters } = this.state;
    return (
      <Toolbar id="toolbar-with-chip-groups" clearAllFilters={this.onDelete} collapseListedFiltersBreakpoint="xl">
        <ToolbarContent>
          <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="xl">
            <ToolbarGroup variant="filter-group">
              {this.buildCategoryDropdown()}
              {this.buildFilterDropdown()}
            </ToolbarGroup>
          </ToolbarToggleGroup>
        </ToolbarContent>
      </Toolbar>
    );
  }

  render() {
    const { loading, rows, columns, filters } = this.state;

    const filteredRows =
      filters.name.length > 0 || filters.location.length > 0 || filters.status.length > 0
        ? rows.filter(row => {
            return (
              (filters.name.length === 0 ||
                filters.name.some(name => row.cells[0].toLowerCase().includes(name.toLowerCase()))) &&
              (filters.location.length === 0 || filters.location.includes(row.cells[5])) &&
              (filters.status.length === 0 || filters.status.includes(row.cells[4]))
            );
          })
        : rows;

    let tableRows = filteredRows;
    if (!loading && filteredRows.length === 0) {
      tableRows = [{
        heightAuto: true,
        cells: [{
          props: { colSpan: 8 },
          title: (
            <Bullseye>
              <EmptyState>
                <EmptyStateIcon icon={SearchIcon} />
                <Title headingLevel="h5" size="lg">
                  Clear all filters and try again.
                </Title>
                <EmptyStateBody>
                  No results match this filter criteria. Remove all filters or clear all filters to show results.
                </EmptyStateBody>
                <EmptyStateSecondaryActions>
                  <Button variant="link" onClick={() => { this.onDelete(null); }}>
                    Clear all filters
                  </Button>
                </EmptyStateSecondaryActions>
              </EmptyState>
            </Bullseye>
          )
        }]
      }]
    } else if (loading) {
      tableRows = [{
        heightAuto: true,
        cells: [{
          props: { colSpan: 8 },
          title: (
            <Title headingLevel="h2" size="3xl">
              Please wait while loading data
            </Title>
          )
        }]
      }]
    }

    return (
      <React.Fragment>
        {this.renderToolbar()}
        <Table cells={columns} rows={tableRows} onSelect={this.onRowSelect} aria-label="Filterable Table Demo">
          <TableHeader />
          <TableBody />
        </Table>
      </React.Fragment>
    );
  }
}
```

### Automatic pagination

The below example illustrates the `defaultToFullPage` prop, which makes the following changes when the user sets the number of items to display per page to an amount that exceeds the remaining amount of data:

- The component automatically changes the page back to the last full page of results, rather than defaulting to the final page of results.

To demonstrate this, navigate to the last page of data below using the `>>` navigation arrows, then use the dropdown selector to change the view to 5 per page.

- The default behavior would show the last page of results, which would only contain the last two rows (rows 11 - 12).
- The `defaultToFullPage` prop navigates you back to the previous page which does contain a full page of 5 rows (rows 6 - 10).

```js
import React from 'react';
import { Pagination } from '@patternfly/react-core';
import { Table, TableHeader, TableBody } from '@patternfly/react-table';

class ComplexPaginationTableDemo extends React.Component {
  constructor(props) {
    super(props);
    this.columns = [{ title: 'First column' }, { title: 'Second column' }, { title: 'Third column' }];
    this.defaultRows = [
      { cells: [{ title: 'Row 1 column 1' }, { title: 'Row 1 column 2' }, { title: 'Row 1 column 3' }] },
      { cells: [{ title: 'Row 2 column 1' }, { title: 'Row 2 column 2' }, { title: 'Row 2 column 3' }] },
      { cells: [{ title: 'Row 3 column 1' }, { title: 'Row 3 column 2' }, { title: 'Row 3 column 3' }] },
      { cells: [{ title: 'Row 4 column 1' }, { title: 'Row 4 column 2' }, { title: 'Row 4 column 3' }] },
      { cells: [{ title: 'Row 5 column 1' }, { title: 'Row 5 column 2' }, { title: 'Row 5 column 3' }] },
      { cells: [{ title: 'Row 6 column 1' }, { title: 'Row 6 column 2' }, { title: 'Row 6 column 3' }] },
      { cells: [{ title: 'Row 7 column 1' }, { title: 'Row 7 column 2' }, { title: 'Row 7 column 3' }] },
      { cells: [{ title: 'Row 8 column 1' }, { title: 'Row 8 column 2' }, { title: 'Row 8 column 3' }] },
      { cells: [{ title: 'Row 9 column 1' }, { title: 'Row 9 column 2' }, { title: 'Row 9 column 3' }] },
      { cells: [{ title: 'Row 10 column 1' }, { title: 'Row 10 column 2' }, { title: 'Row 10 column 3' }] },
      { cells: [{ title: 'Row 11 column 1' }, { title: 'Row 11 column 2' }, { title: 'Row 11 column 3' }] },
      { cells: [{ title: 'Row 12 column 1' }, { title: 'Row 12 column 2' }, { title: 'Row 12 column 3' }] }
    ];
    this.defaultPerPage = 10;
    this.state = {
      perPage: this.defaultPerPage,
      page: 1,
      rows: this.defaultRows.slice(0, this.defaultPerPage)
    };
    this.handleSetPage = this.handleSetPage.bind(this);
    this.handlePerPageSelect = this.handlePerPageSelect.bind(this);
  }

  handleSetPage(_evt, newPage, perPage, startIdx, endIdx) {
    this.setState({
      page: newPage,
      rows: this.defaultRows.slice(startIdx, endIdx)
    });
  }

  handlePerPageSelect(_evt, newPerPage, newPage, startIdx, endIdx) {
    this.setState({
      perPage: newPerPage,
      page: newPage,
      rows: this.defaultRows.slice(startIdx, endIdx)
    });
  }

  renderPagination(variant = 'top') {
    const { page, perPage } = this.state;
    return (
      <Pagination
        isCompact
        itemCount={this.defaultRows.length}
        page={page}
        perPage={perPage}
        defaultToFullPage
        onSetPage={this.handleSetPage}
        onPerPageSelect={this.handlePerPageSelect}
        perPageOptions={[
          { title: '3', value: 3 },
          { title: '5', value: 5 },
          { title: '12', value: 12 },
          { title: '20', value: 20 }
        ]}
        titles={{
          paginationTitle: `${variant} pagination`
        }}
      />
    );
  }

  render() {
    const rows = this.state.rows.map(row => ({ cells: row.cells }));
    return (
      <React.Fragment>
        {this.renderPagination()}
        <Table aria-label="Automated pagination table" cells={this.columns} rows={rows}>
          <TableHeader />
          <TableBody />
        </Table>
      </React.Fragment>
    );
  }
}
```

### Pagination

```js
import React from 'react';
import {
  Checkbox,
  Pagination,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  EmptyState,
  EmptyStateIcon,
  EmptyStateBody,
  EmptyStateVariant,
  Bullseye
} from '@patternfly/react-core';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import globalDangerColor200 from '@patternfly/react-tokens/dist/esm/global_danger_color_200';
import { Table, TableHeader, TableBody } from '@patternfly/react-table';
import { Spinner } from '@patternfly/react-core';

class ComplexPaginationTableDemo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      res: [],
      perPage: 0,
      total: 0,
      page: 0,
      error: null,
      loading: true,
      forceLoadingState: false
    };

    this.handleCheckboxChange = checked => {
      console.log(checked);
      this.setState({ forceLoadingState: checked });
    };
  }

  fetch(page, perPage) {
    this.setState({ loading: true });
    fetch(`https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=${perPage}`)
      .then(resp => resp.json())
      .then(resp => this.setState({ res: resp, perPage, page, loading: false, total: 100 }))
      .catch(err => this.setState({ error: err, loading: false, perPage: 0, page: 0, total: 0 }));
  }

  componentDidMount() {
    this.fetch(this.state.page || 1, this.state.perPage || 20);
  }

  renderPagination(variant = 'top') {
    const { page, perPage, total } = this.state;
    return (
      <Pagination
        isCompact
        itemCount={total}
        page={page}
        perPage={perPage}
        onSetPage={(_evt, value) => this.fetch(value, perPage)}
        onPerPageSelect={(_evt, value) => this.fetch(1, value)}
        variant={variant}
        titles={{
          paginationTitle: `${variant} pagination`
        }}
      />
    );
  }

  render() {
    const { loading, res, error, forceLoadingState } = this.state;

    const toolbarItems = (
      <React.Fragment>
        <ToolbarContent>
          <ToolbarItem>
            <Checkbox
              label="View loading state"
              isChecked={this.state.forceLoadingState}
              onChange={this.handleCheckboxChange}
              aria-label="view loading state checkbox"
              id="check"
              name="check"
            />
          </ToolbarItem>
          <ToolbarItem variant="pagination">{this.renderPagination()}</ToolbarItem>
        </ToolbarContent>
      </React.Fragment>
    );

    if (error) {
      const noResultsRows = [
        {
          heightAuto: true,
          cells: [
            {
              props: { colSpan: 8 },
              title: (
                <Bullseye>
                  <EmptyState variant={EmptyStateVariant.small}>
                    <EmptyStateIcon icon={ExclamationCircleIcon} color={globalDangerColor200.value} />
                    <Title headingLevel="h2" size="lg">
                      Check your connection and reload the page.
                    </Title>
                    <EmptyStateBody>
                      There was an error retrieving data. Check your connection and try again.
                    </EmptyStateBody>
                  </EmptyState>
                </Bullseye>
              )
            }
          ]
        }
      ];

      return (
        <React.Fragment>
          <Table cells={['Title', 'Body']} rows={noResultsRows} aria-label="Pagination Table Demo">
            <TableHeader />
            <TableBody />
          </Table>
        </React.Fragment>
      );
    }

    const loadingRows = [
      {
        heightAuto: true,
        cells: [
          {
            props: { colSpan: 8 },
            title: (
              <Bullseye>
                <center>
                  <Spinner size="xl" />
                </center>
              </Bullseye>
            )
          }
        ]
      }
    ];

    return (
      <React.Fragment>
        <Toolbar>{toolbarItems}</Toolbar>
        {!(loading || forceLoadingState) && (
          <Table
            cells={['Title', 'Body']}
            rows={res.map(post => [post.title, post.body])}
            aria-label="Pagination Table Demo"
          >
            <TableHeader />
            <TableBody />
          </Table>
        )}
        {(loading || forceLoadingState) && (
          <Table cells={['Title', 'Body']} rows={loadingRows} aria-label="Pagination Table Demo">
            <TableHeader />
            <TableBody />
          </Table>
        )}
      </React.Fragment>
    );
  }
}
```

### Sticky header

```js isFullscreen
import React from 'react';
import {
  Avatar,
  Brand,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  ButtonVariant,
  Card,
  CardBody,
  Dropdown,
  DropdownGroup,
  DropdownToggle,
  DropdownItem,
  DropdownSeparator,
  Gallery,
  GalleryItem,
  KebabToggle,
  Nav,
  NavItem,
  NavList,
  Page,
  PageHeader,
  PageSection,
  PageSectionVariants,
  PageSidebar,
  SkipToContent,
  TextContent,
  Text,
  PageHeaderTools,
  PageHeaderToolsGroup,
  PageHeaderToolsItem
} from '@patternfly/react-core';
import { css } from '@patternfly/react-styles';
import BellIcon from '@patternfly/react-icons/dist/esm/icons/bell-icon';
import CogIcon from '@patternfly/react-icons/dist/esm/icons/cog-icon';
import HelpIcon from '@patternfly/react-icons/dist/esm/icons/help-icon';
import imgBrand from '@patternfly/react-core/src/components/Brand/examples/pfLogo.svg';
import imgAvatar from '@patternfly/react-core/src/components/Avatar/examples/avatarImg.svg';
import { Table, TableHeader, TableBody } from '@patternfly/react-table';

class PageLayoutDefaultNav extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isDropdownOpen: false,
      isKebabDropdownOpen: false,
      activeItem: 0,
      res: []
    };
    this.onDropdownToggle = isDropdownOpen => {
      this.setState({
        isDropdownOpen
      });
    };

    this.onDropdownSelect = event => {
      this.setState({
        isDropdownOpen: !this.state.isDropdownOpen
      });
    };

    this.onKebabDropdownToggle = isKebabDropdownOpen => {
      this.setState({
        isKebabDropdownOpen
      });
    };

    this.onKebabDropdownSelect = event => {
      this.setState({
        isKebabDropdownOpen: !this.state.isKebabDropdownOpen
      });
    };

    this.onNavSelect = result => {
      this.setState({
        activeItem: result.itemId
      });
    };
  }

  fetch(page, perPage) {
    this.setState({ loading: true });
    fetch(`https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=${perPage}`)
      .then(resp => resp.json())
      .then(resp => this.setState({ res: resp, perPage, page, total: 100 }))
      .catch(err => this.setState({ error: err, perPage: 0, page: 0, total: 0 }));
  }

  componentDidMount() {
    this.fetch(this.state.page || 1, this.state.perPage || 20);
  }

  render() {
    const { isDropdownOpen, isKebabDropdownOpen, activeItem, res } = this.state;

    const PageNav = (
      <Nav onSelect={this.onNavSelect} aria-label="Nav">
        <NavList>
          <NavItem itemId={0} isActive={activeItem === 0}>
            System Panel
          </NavItem>
          <NavItem itemId={1} isActive={activeItem === 1}>
            Policy
          </NavItem>
          <NavItem itemId={2} isActive={activeItem === 2}>
            Authentication
          </NavItem>
          <NavItem itemId={3} isActive={activeItem === 3}>
            Network Services
          </NavItem>
          <NavItem itemId={4} isActive={activeItem === 4}>
            Server
          </NavItem>
        </NavList>
      </Nav>
    );
    const kebabDropdownItems = [
      <DropdownItem>
        <CogIcon /> Settings
      </DropdownItem>,
      <DropdownItem>
        <HelpIcon /> Help
      </DropdownItem>
    ];
    const userDropdownItems = [
      <DropdownGroup key="group 2">
        <DropdownItem key="group 2 profile">My profile</DropdownItem>
        <DropdownItem key="group 2 user" component="button">
          User management
        </DropdownItem>
        <DropdownItem key="group 2 logout">Logout</DropdownItem>
      </DropdownGroup>
    ];
    const headerTools = (
      <PageHeaderTools>
        <PageHeaderToolsGroup
          visibility={{
            default: 'hidden',
            lg: 'visible'
          }} /** the settings and help icon buttons are only visible on desktop sizes and replaced by a kebab dropdown for other sizes */
        >
          <PageHeaderToolsItem>
            <Button aria-label="Settings actions" variant={ButtonVariant.plain}>
              <CogIcon />
            </Button>
          </PageHeaderToolsItem>
          <PageHeaderToolsItem>
            <Button aria-label="Help actions" variant={ButtonVariant.plain}>
              <HelpIcon />
            </Button>
          </PageHeaderToolsItem>
        </PageHeaderToolsGroup>
        <PageHeaderToolsGroup>
          <PageHeaderToolsItem
            visibility={{
              lg: 'hidden'
            }} /** this kebab dropdown replaces the icon buttons and is hidden for desktop sizes */
          >
            <Dropdown
              isPlain
              position="right"
              onSelect={this.onKebabDropdownSelect}
              toggle={<KebabToggle onToggle={this.onKebabDropdownToggle} />}
              isOpen={isKebabDropdownOpen}
              dropdownItems={kebabDropdownItems}
            />
          </PageHeaderToolsItem>
          <PageHeaderToolsItem
            visibility={{ default: 'hidden', md: 'visible' }} /** this user dropdown is hidden on mobile sizes */
          >
            <Dropdown
              isPlain
              position="right"
              onSelect={this.onDropdownSelect}
              isOpen={isDropdownOpen}
              toggle={<DropdownToggle onToggle={this.onDropdownToggle}>John Smith</DropdownToggle>}
              dropdownItems={userDropdownItems}
            />
          </PageHeaderToolsItem>
        </PageHeaderToolsGroup>
        <Avatar src={imgAvatar} alt="Avatar image" />
      </PageHeaderTools>
    );

    const Header = (
      <PageHeader logo={<Brand src={imgBrand} alt="Patternfly Logo" />} headerTools={headerTools} showNavToggle />
    );
    const Sidebar = <PageSidebar nav={PageNav} />;
    const pageId = 'main-content-page-layout-default-nav';
    const PageSkipToContent = <SkipToContent href={`#${pageId}`}>Skip to content</SkipToContent>;

    const PageBreadcrumb = (
      <Breadcrumb>
        <BreadcrumbItem>Section home</BreadcrumbItem>
        <BreadcrumbItem to="#">Section title</BreadcrumbItem>
        <BreadcrumbItem to="#">Section title</BreadcrumbItem>
        <BreadcrumbItem to="#" isActive>
          Section landing
        </BreadcrumbItem>
      </Breadcrumb>
    );

    return (
      <React.Fragment>
        <Page
          header={Header}
          sidebar={Sidebar}
          isManagedSidebar
          skipToContent={PageSkipToContent}
          breadcrumb={PageBreadcrumb}
          mainContainerId={pageId}
        >
          <PageSection variant={PageSectionVariants.light}>
            <TextContent>
              <Text component="h1">Main title</Text>
              <Text component="p">
                Body text should be Overpass Regular at 16px. It should have leading of 24px because <br />
                of its relative line height of 1.5.
              </Text>
            </TextContent>
          </PageSection>
          <PageSection>
            <Table
              cells={['Title', 'Body']}
              rows={res.map(post => [post.title, post.body])}
              aria-label="Sticky Header Table Demo"
              isStickyHeader
            >
              <TableHeader />
              <TableBody />
            </Table>
          </PageSection>
        </Page>
      </React.Fragment>
    );
  }
}
```

## Empty states

These examples demonstrate the use of an [Empty State component](/documentation/react/components/emptystate) inside of a [Table](/documentation/react/components/table). Empty states are useful in a table when a filter returns no results, while data is loading, or when any type of error or exception condition occurs.

### Empty

```js
import React from 'react';
import {
  Bullseye,
  Button,
  EmptyState,
  EmptyStateIcon,
  EmptyStateBody,
  EmptyStateSecondaryActions,
  Title
} from '@patternfly/react-core';
import SearchIcon from '@patternfly/react-icons/dist/esm/icons/search-icon';
import { Table, TableHeader, TableBody } from '@patternfly/react-table';

class EmptyStateDemo extends React.Component {
  render() {
    const columns = [
      { title: 'Servers' },
      { title: 'Threads' },
      { title: 'Applications' },
      { title: 'Workspaces' },
      { title: 'Status' },
      { title: 'Location' }
    ];

    const rows = [{
      heightAuto: true,
      cells: [{
        props: { colSpan: 8 },
        title: (
          <EmptyState>
            <EmptyStateIcon icon={SearchIcon} />
            <Title headingLevel="h5" size="lg">
              No results found
            </Title>
            <EmptyStateBody>
              No results match this filter criteria. Clear all filters and try again.
            </EmptyStateBody>
            <EmptyStateSecondaryActions>
              <Button variant="link" onClick={() => {}}>
                Clear all filters
              </Button>
            </EmptyStateSecondaryActions>
          </EmptyState>
        )
      }]
    }];

    return (
      <Table cells={columns} rows={rows} aria-label="Empty state demo">
        <TableHeader />
        <TableBody />
      </Table>
    );
  }
}
```

### Loading

```js
import React from 'react';
import { Bullseye, Spinner } from '@patternfly/react-core';
import { Table, TableHeader, TableBody } from '@patternfly/react-table';

class LoadingStateDemo extends React.Component {
  render() {
    const columns = [
      { title: 'Servers' },
      { title: 'Threads' },
      { title: 'Applications' },
      { title: 'Workspaces' },
      { title: 'Status' },
      { title: 'Location' }
    ];
    const rows = [
      {
        heightAuto: true,
        cells: [
          {
            props: { colSpan: 8 },
            title: (
              <Bullseye>
                <Spinner size="xl" />
              </Bullseye>
            )
          }
        ]
      }
    ];

    return (
      <Table cells={columns} rows={rows} aria-label="Loading Table Demo">
        <TableHeader />
        <TableBody />
      </Table>
    );
  }
}
```

### Error

```js
import React from 'react';
import { Bullseye, EmptyState, EmptyStateBody, EmptyStateIcon, EmptyStateVariant, Title } from '@patternfly/react-core';
import { Table, TableHeader, TableBody } from '@patternfly/react-table';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import globalDangerColor200 from '@patternfly/react-tokens/dist/esm/global_danger_color_200';

class ErrorStateDemo extends React.Component {
  render() {
    const columns = [
      { title: 'Servers' },
      { title: 'Threads' },
      { title: 'Applications' },
      { title: 'Workspaces' },
      { title: 'Status' },
      { title: 'Location' }
    ];
    const rows = [
      {
        heightAuto: true,
        cells: [
          {
            props: { colSpan: 8 },
            title: (
              <EmptyState variant={EmptyStateVariant.small}>
                <Title headingLevel="h2" size="lg">
                  Unable to connect
                </Title>
                <EmptyStateBody>
                  There was an error retrieving data. Check your connection and reload the page.
                </EmptyStateBody>
              </EmptyState>
            )
          }
        ]
      }
    ];

    return (
      <Table cells={columns} rows={rows} aria-label="Error Table Demo">
        <TableHeader />
        <TableBody />
      </Table>
    );
  }
}
```
