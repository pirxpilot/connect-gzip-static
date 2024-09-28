/**
 * Module dependencies.
 */

import EventEmitter from "events";
import http from "http";
import type { AddressInfo } from "net";
import type { IMethod } from "./types";

export function request(app: any) {
  return new InternalRequest(app);
}

class InternalRequest extends EventEmitter {
  app: any;
  path?: string;
  method?: IMethod;
  listening = false;
  addr!: AddressInfo;
  data: string[] = [];
  server?: http.Server = undefined;
  header: Record<string, string> = {};
  constructor(app: any) {
    super();
    this.app = app;
    if (!this.server) {
      this.server = new http.Server(app);
      this.server.listen(0, "0.0.0.0", () => {
        if (this.server) {
          this.addr = this.server.address() as AddressInfo;
          this.listening = true;
        }
      });
    }
  }

  public request(method: IMethod, path: string) {
    this.method = method;
    this.path = path;
    return this;
  }

  public get(path: string) {
    return this.request("get", path);
  }

  public post(path: string) {
    return this.request("post", path);
  }

  public put(path: string) {
    return this.request("put", path);
  }

  public delete(path: string) {
    return this.request("delete", path);
  }

  public head(path: string) {
    return this.request("head", path);
  }

  public set(field: string, value: string) {
    this.header[field] = value;
    return this;
  }

  public write(data: string) {
    this.data.push(data);
    return this;
  }

  public expect(body: any, fn: () => void) {
    const args = arguments;
    this.end(res => {
      switch (args.length) {
        case 3:
          // @ts-ignore
          res.headers?.should?.have?.property?.(body.toLowerCase(), args[1]);
          args[2]();
          break;
        default:
          if ("number" == typeof body) {
            // @ts-ignore
            res?.statusCode?.should?.equal?.(body);
          } else {
            // @ts-ignore
            res?.body?.should?.equal?.(body);
          }
          fn();
      }
    });
    return this;
  }

  public end(fn: (response: http.IncomingMessage) => void) {
    if (this.listening) {
      const req = http.request({
        method: this.method,
        port: this.addr.port,
        host: this.addr.address,
        path: this.path,
        headers: this.header,
      });

      this.data.forEach(chunk => {
        req.write(chunk);
      });

      req.on("response", res => {
        let buf = "";
        res.setEncoding("utf8");
        res.on("data", chunk => {
          buf += chunk;
        });
        res.on("end", function () {
          // @ts-ignore
          res.body = buf;
          fn(res);
        });
      });

      req.end();
    } else if (this.server) {
      this.server.on("listening", () => {
        this.end(fn);
      });
    }

    return this;
  }

  public close(fn: () => void) {
    if (this.server) {
      this.server.close(fn);
    } else {
      fn();
    }
    this.server = undefined;
  }
}
