import React, { ReactElement } from "react";
import { PropertyPreviewProps } from "firecms";

import CheckBoxOutlineBlank from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxOutlined from "@mui/icons-material/CheckBoxOutlined";

export function CustomPricePreview({ value, property, size }: PropertyPreviewProps<number>) {
    return (
        <div>${value}</div>
    );
}
