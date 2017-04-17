import {Component, ElementRef, Input, OnInit} from '@angular/core';
import {Node} from '../../shared/node.model';
import * as d3 from 'd3';
import {NodeUtility} from '../../shared/node-utility.model';
import {Router} from '@angular/router';

@Component({
  selector   : 'app-visual',
  templateUrl: './visual.component.html',
  styleUrls  : ['./visual.component.css']
})
export class VisualComponent implements OnInit {

  @Input()
  node: Node;

  htmlElement;
  host;

  selectedNode: Node;

  constructor(private element: ElementRef,
              private router: Router) {

    this.htmlElement = this.element.nativeElement;
    this.host        = d3.select(this.element.nativeElement);
  }

  ngOnInit(): void {
    this.initTree(this.node);
  }

  /****************************************************/
  /****************************************************/
  /****************************************************/

  initTree(node: Node): void {
    // visual class width = 1000px, thus 500 is the center
    const center     = 500;
    const nodeRadius = 25;
    const mainDiv    = this.host.append('div').classed('container', true);
    const svg        = mainDiv.append('svg').attr('class', 'visual');
    const mainGroup  = svg.append('g')
        .attr('transform', `translate(${center},${center})`);

    const cluster = d3.layout.cluster()
        .size([360, center / 1.5]);

    const nodes = cluster.nodes(node);
    const links = cluster.links(nodes);

    const diagonal = d3.svg.diagonal.radial()
        .projection(function (d) {
          return [
            d.y,
            d.x / 180 * Math.PI
          ];
        });

    mainGroup.selectAll('path')
        .data(links)
        .enter()
        .append('path')
        .attr({
          d             : diagonal,
          fill          : 'none',
          stroke        : '#ccc',
          'stroke-width': 5
        });

    const nodeGroups = mainGroup.selectAll('g')
        .data(nodes)
        .enter()
        .append('g')
        .attr('transform', function (d) {
          return `rotate(${d.x - 90})translate(${d.y})`;
        });

    nodeGroups.append('circle')
        .attr('r', (d: Node) => {
          if (d.id === this.node.id) {
            return nodeRadius * 2;
          } else if (!d.children || d.children.length === 0) {
            return nodeRadius / 2;
          } else {
            return nodeRadius;
          }
        })
        // Stylesheet graph.css
        .classed('leaf-node', (d: Node) => {
          return !d.children || d.children.length === 0;
        })
        .classed('parent-node', (d: Node) => {
          return d.children && d.children.length > 0;
        })
        .on('dblclick', (d: Node) => {
          this.selectedNode = d;
          this.navigate(d);
        });

    nodeGroups.append('text')
        .attr('class', 'tree-text')
        .attr({
          dy           : '.51em',
          'text-anchor': function (d) {
            return d.x < 180 ? 'start' : 'end';
          },
          transform    : (d: Node) => {
            if (d.id === this.node.id) {
              return d.x < 180 ?
                  'translate(' + (nodeRadius * 3.0) + ')' :
                  'rotate(180)' +
                  'translate(' + (-nodeRadius * 3.0) + ')';
            } else {
              return d.x < 180 ?
                  'translate(' + (nodeRadius * 1.50) + ')' :
                  'rotate(180)' +
                  'translate(' + (-nodeRadius * 1.50) + ')';
            }
          }
        })
        .text(function (d: Node) {
          return NodeUtility.title(d);
        });
  }

  navigate(node: Node): void {
    if (this.selectedNode) {
      this.router.navigate(['/projects', node.id, 'detail']);
    }
  }
}
