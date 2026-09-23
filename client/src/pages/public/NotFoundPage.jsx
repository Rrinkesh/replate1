import React from "react";
import { Link } from "react-router-dom";
import { EmptyState, Button } from "../../components/common";
import { FileQuestion, Home } from "lucide-react";

const NotFoundPage = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20">
      <EmptyState
        icon={FileQuestion}
        title="404 — Page Not Found"
        description="The page you are looking for does not exist or has been moved."
        actionButton={
          <Link to="/">
            <Button variant="primary" iconLeft={Home}>
              Return Home
            </Button>
          </Link>
        }
      />
    </div>
  );
};

export default NotFoundPage;
