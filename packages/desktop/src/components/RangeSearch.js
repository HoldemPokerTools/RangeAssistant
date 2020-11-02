import React from "react";
import { AutoComplete, Input } from "antd";

const renderItem = (range) => {
  return {
    value: range._id,
    title: range.title,
    label: (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {range.title}
      </div>
    ),
  };
};

export const RangeSearch = ({ ranges, value = "", ...props }) => {
  const onSelect = (data) => {
    props.onSelect && props.onSelect(data);
  };

  const onChange = (data) => {
    props.onChange && props.onChange(data);
  };

  return (
    <AutoComplete
      {...props}
      value={value}
      onChange={onChange}
      onSelect={onSelect}
      options={ranges.map((r) => renderItem(r))}
      filterOption={(inputValue, option) => {
        const searchParts = inputValue.split(" ");
        return searchParts.every(part => option.title.toLowerCase().indexOf(part.toLowerCase()) !== -1);
      }}
    >
      <Input.Search size="large" placeholder="Search ranges" />
    </AutoComplete>
  );
};

export default RangeSearch;

