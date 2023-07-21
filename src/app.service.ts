import { Injectable } from '@nestjs/common';
import * as k8s from '@kubernetes/client-node';
import axios from 'axios';
import WebHookDto from './dtos/WebHook.dto';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async getSrvEndpoints(): Promise<string[]> {
    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();
    const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
    const namespace = process.env.K8S_NAMESPACE ?? 'default';
    try {
      const res = await k8sApi.readNamespacedEndpoints(
        'frontend-srv',
        namespace,
      );
      const ips = res.body.subsets[0].addresses.map((address) => {
        return address.ip;
      });
      return ips;
    } catch (err) {
      console.log(err);
      return ['host.docker.internal'];
    }
  }

  callNextRevalidate(ips: string[], body: WebHookDto) {
    const token = process.env.REVALIDATE_TOKEN ?? 'token';
    const port = process.env.NEXTJS_PORT ?? '3000';
    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    };
    const promises = ips.map((ip) =>
      axios.post(`http://${ip}:${port}/api/revalidate`, body, { headers }),
    );
    Promise.all(promises)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  }
}
