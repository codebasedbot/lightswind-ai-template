import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { HomeIcon } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">

      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <Card className="max-w-md w-full p-8 shadow-none  text-center">
        <CardContent className="space-y-6">
          <h1 className="text-6xl font-extrabold text-primarylw">404</h1>
          <h2 className="text-2xl font-bold text-foreground">Page Not Found</h2>
          <p className="text-foreground/70">
            Oops! The page you are looking for does not exist or has been moved.
          </p>
          <Button
            variant="default"
            size="lg"
            onClick={() => navigate("/")}
            className="w-full"
          >
            <HomeIcon/> Go Back Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
