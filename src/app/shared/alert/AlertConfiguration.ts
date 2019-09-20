export interface AlertConfiguration {
  message: string;
  positiveButtonLabel: string;
  onPositiveButtonClicked: () => void;
  negativeButtonLabel?: string;
  onNegativeButtonClicked: () => void;
  dismissable?: boolean;
  showOverlay?: boolean;
}
