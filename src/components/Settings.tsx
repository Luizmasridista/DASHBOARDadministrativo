
import GeneralSettingsSection from "./settings/GeneralSettingsSection";
import ExportReportsSection from "./settings/ExportReportsSection";
import SynchronizationSection from "./settings/SynchronizationSection";

const Settings = () => {
  return (
    <div className="space-y-6">
      <GeneralSettingsSection />
      <ExportReportsSection />
      <SynchronizationSection />
    </div>
  );
};

export default Settings;
