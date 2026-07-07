import classes from "./BeachStandLabel.module.css";

type BeachStandLabelProps = {
  name: string;
};

export const BeachStandLabel = ({ name }: BeachStandLabelProps) => (
  <div className={classes.label}>{name}</div>
);
