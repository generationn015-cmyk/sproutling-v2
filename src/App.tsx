import { Route, Switch } from "wouter";
import { Layout } from "./components/Layout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useAppSource, AppCtx } from "./hooks/useApp";
import { TodayPage } from "./pages/Today";
import { PlantsPage } from "./pages/Plants";
import { PlantNewPage } from "./pages/PlantNew";
import { PlantProfilePage } from "./pages/PlantProfile";
import { JournalPage } from "./pages/Journal";
import { SettingsPage } from "./pages/Settings";
import { NotFoundPage } from "./pages/NotFound";

export default function App() {
  const store = useAppSource();
  return (
    <AppCtx.Provider value={store}>
      <ErrorBoundary>
        <Layout>
          <Switch>
            <Route path="/" component={TodayPage} />
            <Route path="/today" component={TodayPage} />
            <Route path="/plants/new" component={PlantNewPage} />
            <Route path="/plants/:id" component={PlantProfilePage} />
            <Route path="/plants" component={PlantsPage} />
            <Route path="/journal" component={JournalPage} />
            <Route path="/settings" component={SettingsPage} />
            <Route component={NotFoundPage} />
          </Switch>
        </Layout>
      </ErrorBoundary>
    </AppCtx.Provider>
  );
}
