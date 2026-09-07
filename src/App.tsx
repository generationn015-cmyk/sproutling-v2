import { Redirect, Route, Switch } from "wouter";
import { Layout } from "./components/Layout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useAppSource, AppCtx, useApp } from "./hooks/useApp";
import { TodayPage } from "./pages/Today";
import { PlantsPage } from "./pages/Plants";
import { PlantNewPage } from "./pages/PlantNew";
import { PlantProfilePage } from "./pages/PlantProfile";
import { JournalPage } from "./pages/Journal";
import { SettingsPage } from "./pages/Settings";
import { NotFoundPage } from "./pages/NotFound";
import { WelcomePage } from "./pages/Welcome";
import { SignInPage, SignUpPage } from "./pages/Auth";
import { OnboardingPage } from "./pages/Onboarding";
import { BrandMark } from "./components/Layout";

export default function App() {
  const store = useAppSource();
  return (
    <AppCtx.Provider value={store}>
      <ErrorBoundary>
        <Gate />
      </ErrorBoundary>
    </AppCtx.Provider>
  );
}

function Gate() {
  const { ready, signedIn, user } = useApp();

  if (!ready) return <Splash />;

  if (!signedIn) {
    return (
      <Switch>
        <Route path="/signup" component={SignUpPage} />
        <Route path="/signin" component={SignInPage} />
        <Route path="/onboarding" component={WelcomePage} />
        <Route component={WelcomePage} />
      </Switch>
    );
  }

  if (!user.onboarded) {
    return (
      <Switch>
        <Route path="/onboarding" component={OnboardingPage} />
        <Route>
          <Redirect to="/onboarding" />
        </Route>
      </Switch>
    );
  }

  return (
    <Layout>
      <Switch>
        <Route path="/" component={TodayPage} />
        <Route path="/today" component={TodayPage} />
        <Route path="/signup">
          <Redirect to="/" />
        </Route>
        <Route path="/signin">
          <Redirect to="/" />
        </Route>
        <Route path="/onboarding">
          <Redirect to="/" />
        </Route>
        <Route path="/plants/new" component={PlantNewPage} />
        <Route path="/plants/:id" component={PlantProfilePage} />
        <Route path="/plants" component={PlantsPage} />
        <Route path="/journal" component={JournalPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route component={NotFoundPage} />
      </Switch>
    </Layout>
  );
}

function Splash() {
  return (
    <div className="ios-screen grid min-h-dvh place-items-center bg-parchment-2">
      <div className="flex flex-col items-center gap-4">
        <BrandMark />
        <p className="serif text-2xl text-forest">sproutling</p>
      </div>
    </div>
  );
}
