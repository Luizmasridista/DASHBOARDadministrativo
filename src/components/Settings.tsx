
import GoogleSheetsAPISection from "./settings/GoogleSheetsAPISection";
import GeneralSettingsSection from "./settings/GeneralSettingsSection";
import ExportReportsSection from "./settings/ExportReportsSection";
import SynchronizationSection from "./settings/SynchronizationSection";

const Settings = () => {
  return (
    <div className="space-y-6">
      <GoogleSheetsAPISection />
      <GeneralSettingsSection />
      <ExportReportsSection />
      <SynchronizationSection />
    </div>
  );
};

export default Settings;
