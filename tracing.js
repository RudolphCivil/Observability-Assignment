const { Resource } = require("@opentelemetry/resources");
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");
const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
const { SimpleSpanProcessor } = require("@opentelemetry/sdk-trace-base");
const { trace } = require("@opentelemetry/api");

// Instrumentations
const { ExpressInstrumentation } = require("opentelemetry-instrumentation-express");
const { MongoDBInstrumentation } = require("@opentelemetry/instrumentation-mongodb");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");

// Exporter for Jaeger
const { JaegerExporter } = require("@opentelemetry/exporter-jaeger");

// Jaeger configuration
const jaegerExporter = new JaegerExporter({
  serviceName: "todo-service", // Replace with your service name
  host: "localhost",
  port: 6832,
});

// Setup the Tracer Provider with Jaeger
const provider = new NodeTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: "todo-service",
  }),
});

provider.addSpanProcessor(new SimpleSpanProcessor(jaegerExporter));
provider.register();

// Register the instrumentations
registerInstrumentations({
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
    new MongoDBInstrumentation(),
  ],
  tracerProvider: provider,
});

// Export the tracer
module.exports = (serviceName) => {
  return trace.getTracer(serviceName);
};
