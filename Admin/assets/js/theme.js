/*
 * HSCore
 * @version: 2.0.0 (Mon, 25 Nov 2019)
 * @requires: jQuery v3.0 or later
 * @author: HtmlStream
 * @event-namespace: .HSCore
 * @license: Htmlstream Libraries (https://htmlstream.com/licenses)
 * Copyright 2020 Htmlstream
 */
"use strict";
$.extend({
    HSCore: {
        init: function () {
            $(document).ready(function () {
                $('[data-toggle="tooltip"]').tooltip(), $('[data-toggle="popover"]').popover();
            });
        },
        components: {},
    },
    }),
    $.HSCore.init(),
    (function (t) {
        t.HSCore.components.HSDatatables = {
            defaults: {
                paging: !0,
                info: { currentInterval: null, totalQty: null, divider: " to " },
                isSelectable: !1,
                isColumnsSearch: !1,
                isColumnsSearchTheadAfter: !1,
                pagination: null,
                paginationClasses: "pagination datatable-custom-pagination",
                paginationLinksClasses: "page-link",
                paginationItemsClasses: "page-item",
                paginationPrevClasses: "page-item",
                paginationPrevLinkClasses: "page-link",
                paginationPrevLinkMarkup: '<span aria-hidden="true">Prev</span>',
                paginationNextClasses: "page-item",
                paginationNextLinkClasses: "page-link",
                paginationNextLinkMarkup: '<span aria-hidden="true">Next</span>',
                detailsInvoker: null,
                select: null,
            },
            init: function (e, a) {
                if (e.length) {
                    var s = Object.assign({}, this.defaults),
                        n = e.attr("data-hs-datatables-options") ? JSON.parse(e.attr("data-hs-datatables-options")) : {},
                        i = {};
                    i = t.extend(s, i, n, a);
                    var o = e.DataTable(i),
                        r = new t.fn.dataTable.Api(e),
                        l = function () {
                            var a = r.page.info(),
                                s = t("#" + r.context[0].nTable.id + "_paginate"),
                                n = s.find(".paginate_button.previous"),
                                o = s.find(".paginate_button.next"),
                                l = s.find(".paginate_button:not(.previous):not(.next), .ellipsis");
                            n.wrap('<span class="' + i.paginationItemsClasses + '"></span>'),
                                n.addClass(i.paginationPrevLinkClasses).html(i.paginationPrevLinkMarkup),
                                o.wrap('<span class="' + i.paginationItemsClasses + '"></span>'),
                                o.addClass(i.paginationNextLinkClasses).html(i.paginationNextLinkMarkup),
                                n.unwrap(n.parent()).wrap('<li class="paginate_item ' + i.paginationItemsClasses + '"></li>'),
                                n.hasClass("disabled") && (n.removeClass("disabled"), n.parent().addClass("disabled")),
                                o.unwrap(o.parent()).wrap('<li class="paginate_item ' + i.paginationItemsClasses + '"></li>'),
                                o.hasClass("disabled") && (o.removeClass("disabled"), o.parent().addClass("disabled")),
                                l.unwrap(l.parent()),
                                l.each(function () {
                                    t(this).hasClass("current")
                                        ? (t(this).removeClass("current"), t(this).wrap('<li class="paginate_item ' + i.paginationItemsClasses + ' active"></li>'))
                                        : t(this).wrap('<li class="paginate_item ' + i.paginationItemsClasses + '"></li>');
                                }),
                                l.addClass(i.paginationLinksClasses),
                                s.prepend('<ul id="' + r.context[0].nTable.id + '_pagination" class="' + i.paginationClasses + '"></ul>'),
                                s.find(".paginate_item").appendTo("#" + r.context[0].nTable.id + "_pagination"),
                                a.pages <= 1 ? t("#" + i.pagination).hide() : t("#" + i.pagination).show(),
                                i.info.currentInterval && t(i.info.currentInterval).html(a.start + 1 + i.info.divider + a.end),
                                i.info.totalQty && t(i.info.totalQty).html(a.recordsDisplay),
                                i.scrollY && e.find(t(".dataTables_scrollBody thead tr")).css({ visibility: "hidden" });
                        };
                    return (
                        l(),
                        o.on("draw", l),
                        this.customPagination(e, o, i),
                        this.customSearch(e, o, i),
                        i.isColumnsSearch && this.customColumnsSearch(e, o, i),
                        this.customEntries(e, o, i),
                        i.isSelectable && this.rowChecking(e),
                        this.details(e, i.detailsInvoker, o),
                        i.select && this.select(i.select, o),
                        o
                    );
                }
            },
            customPagination: function (e, a, s) {
                t("#" + s.pagination).append(t("#" + a.context[0].nTable.id + "_paginate"));
            },
            customSearch: function (e, a, s) {
                t(s.search).on("keyup", function () {
                    a.search(this.value).draw();
                });
            },
            customColumnsSearch: function (e, a, s) {
                var n = s;
                a.columns().every(function () {
                    var e = this;
                    n.isColumnsSearchTheadAfter && t(".dataTables_scrollFoot").insertAfter(".dataTables_scrollHead"),
                        t("input", this.footer()).on("keyup change", function () {
                            e.search() !== this.value && e.search(this.value).draw();
                        }),
                        t("select", this.footer()).on("change", function () {
                            e.search() !== this.value && e.search(this.value).draw();
                        });
                });
            },
            customEntries: function (e, a, s) {
                t(s.entries).on("change", function () {
                    var e = t(this).val();
                    a.page.len(e).draw();
                });
            },
            rowChecking: function (e) {
                t(e).on("change", "input", function () {
                    t(this).parents("tr").toggleClass("checked");
                });
            },
            format: function (t) {
                return t;
            },
            details: function (e, a, s) {
                if (a) {
                    var n = this;
                    t(e).on("click", a, function () {
                        var e = t(this).closest("tr"),
                            a = s.row(e);
                        a.child.isShown() ? (a.child.hide(), e.removeClass("opened")) : (a.child(n.format(e.data("details"))).show(), e.addClass("opened"));
                    });
                }
            },
            select: function (e, a) {
                t(e.classMap.checkAll).on("click", function () {
                    t(this).is(":checked")
                        ? (a.rows().select(),
                          a
                              .rows()
                              .nodes()
                              .each(function (a) {
                                  t(a).find(e.selector).prop("checked", !0);
                              }))
                        : (a.rows().deselect(),
                          a
                              .rows()
                              .nodes()
                              .each(function (a) {
                                  t(a).find(e.selector).prop("checked", !1);
                              }));
                }),
                    a
                        .on("select", function () {
                            t(e.classMap.counter).text(a.rows(".selected").data().length),
                                a.rows().data().length !== a.rows(".selected").data().length ? t(e.classMap.checkAll).prop("checked", !1) : t(e.classMap.checkAll).prop("checked", !0),
                                0 === a.rows(".selected").data().length ? t(e.classMap.counterInfo).hide() : t(e.classMap.counterInfo).show();
                        })
                        .on("deselect", function () {
                            t(e.classMap.counter).text(a.rows(".selected").data().length),
                                a.rows().data().length !== a.rows(".selected").data().length ? t(e.classMap.checkAll).prop("checked", !1) : t(e.classMap.checkAll).prop("checked", !0),
                                0 === a.rows(".selected").data().length ? t(e.classMap.counterInfo).hide() : t(e.classMap.counterInfo).show();
                        });
            },
        };
    })(jQuery),
    (function (t) {
        t.HSCore.components.HSClipboard = {
            defaults: { type: null, contentTarget: null, classChangeTarget: null, defaultClass: null, successText: null, successClass: null, originalTitle: null },
            init: function (e, a) {
                if (t(e).length) {
                    var s = t(e),
                        n = Object.assign({}, this.defaults),
                        i = s.attr("data-hs-clipboard-options") ? JSON.parse(s.attr("data-hs-clipboard-options")) : {},
                        o = {
                            shortcodes: {},
                            windowWidth: t(window).width(),
                            defaultText: s.get(0).lastChild.nodeValue,
                            title: s.attr("title"),
                            container: !!i.container && document.querySelector(i.container),
                            text: function (e) {
                                var a = JSON.parse(t(e).attr("data-hs-clipboard-options"));
                                return o.shortcodes[a.contentTarget];
                            },
                        };
                    (o = t.extend(!0, n, i, o, a)), i.contentTarget && this.setShortcodes(s, o);
                    var r = new ClipboardJS(e, o);
                    return (
                        r.on("success", function () {
                            (o.successText || o.successClass) &&
                                (o.successText &&
                                    ("tooltip" === o.type
                                        ? (s.attr("data-original-title", o.successText).tooltip("show"),
                                          s.on("mouseleave", function () {
                                              s.attr("data-original-title", o.title);
                                          }))
                                        : "popover" === o.type
                                        ? (s.attr("data-original-title", o.successText).popover("show"),
                                          s.on("mouseleave", function () {
                                              s.attr("data-original-title", o.title).popover("hide");
                                          }))
                                        : ((s.get(0).lastChild.nodeValue = " " + o.successText + " "),
                                          setTimeout(function () {
                                              s.get(0).lastChild.nodeValue = o.defaultText;
                                          }, 800))),
                                o.successClass &&
                                    (o.classChangeTarget
                                        ? (t(o.classChangeTarget).removeClass(o.defaultClass).addClass(o.successClass),
                                          setTimeout(function () {
                                              t(o.classChangeTarget).removeClass(o.successClass).addClass(o.defaultClass);
                                          }, 800))
                                        : (s.removeClass(o.defaultClass).addClass(o.successClass),
                                          setTimeout(function () {
                                              s.removeClass(o.successClass).addClass(o.defaultClass);
                                          }, 800))));
                        }),
                        r
                    );
                }
            },
            setShortcodes: function (e, a) {
                var s = a;
                t(s.contentTarget).is("input, textarea, select") ? (s.shortcodes[s.contentTarget] = t(s.contentTarget).val()) : (s.shortcodes[s.contentTarget] = t(s.contentTarget).html());
            },
        };
    })(jQuery),
    (function (t) {
        t.HSCore.components.HSSelect2 = {
            defaults: { data: [], width: "100%", customClass: "custom-select", searchInputPlaceholder: !1, singleMultiple: !1, singleMultipleActiveClass: "active", singleMultiplePostfix: " item(s) selected", singleMultiplePrefix: null },
            init: function (e, a) {
                if (e.length) {
                    var s = this,
                        n = Object.assign({}, s.defaults),
                        i = e.attr("data-hs-select2-options") ? JSON.parse(e.attr("data-hs-select2-options")) : {},
                        o = {
                            templateResult: s.formatData,
                            templateSelection: s.formatData,
                            escapeMarkup: function (t) {
                                return t;
                            },
                        };
                    o = t.extend(!0, n, o, i, a);
                    var r = e.select2(o);
                    return (
                        e.siblings(".select2").find(".select2-selection").removeClass("select2-selection--single").addClass(o.customClass),
                        o.singleMultiple &&
                            (s.singleMultiple(e, o),
                            r.on("select2:select", function (t) {
                                s.singleMultiple(e, o);
                            }),
                            r.on("select2:unselect", function (t) {
                                s.singleMultiple(e, o);
                            })),
                        s.safariAutoWidth(r, o),
                        s.leftOffset(r, o),
                        s.dropdownWidth(r, o),
                        o.searchInputPlaceholder && s.searchPlaceholder(r, o),
                        r
                    );
                }
            },
            dropdownWidth: function (e, a) {
                var s = a;
                e.on("select2:open", function () {
                    t(".select2-container--open").last().css({ width: s.dropdownWidth });
                });
            },
            safariAutoWidth: function (e, a) {
                e.on("select2:open", function () {
                    t(".select2-container--open").css({ top: 0 });
                });
            },
            singleMultiple: function (e, a) {
                var s = a;
                let n = t(e).next(".select2").find(".select2-selection"),
                    i = e.find(":selected").length > 0 ? s.singleMultiplePrefix + e.find(":selected").length + s.singleMultiplePostfix : s.placeholder;
                n.removeClass("select2-selection--multiple"),
                    e.find(":selected").length > 0 ? n.addClass(s.singleMultipleActiveClass) : n.removeClass(s.singleMultipleActiveClass),
                    n
                        .find(".select2-selection__rendered")
                        .replaceWith(
                            '<span class="select2-selection__rendered" role="textbox" aria-readonly="true"><span class="select2-selection__placeholder">' +
                                i +
                                '</span></span><span class="select2-selection__arrow" role="presentation"><b role="presentation"></b></span>'
                        );
            },
            formatData: function (e) {
                var a,
                    s = e;
                return s.element ? ((a = s.element.dataset.optionTemplate ? s.element.dataset.optionTemplate : "<span>" + s.text + "</span>"), t.parseHTML(a)) : s.text;
            },
            leftOffset: function (e, a) {
                var s = a;
                e.on("select2:open", function () {
                    if (s.leftOffset) {
                        let e = t(".select2-container--open").last();
                        e.css({ opacity: 0 }),
                            setTimeout(function () {
                                e.css({ left: parseInt(e.position().left) + s.leftOffset, opacity: 1 });
                            }, 1);
                    }
                });
            },
            searchPlaceholder: function (e, a) {
                var s = a;
                e.on("select2:open", function () {
                    t(".select2-container--open .select2-search__field").last().attr("placeholder", s.searchInputPlaceholder);
                });
            },
        };
    })(jQuery),
    (function (t) {
        t.HSCore.components.HSMask = {
            defaults: { template: null },
            init: function (e, a) {
                if (e.length && void 0 !== e.attr("data-hs-mask-options")) {
                    var s = Object.assign({}, this.defaults),
                        n = e.attr("data-hs-mask-options") ? JSON.parse(e.attr("data-hs-mask-options")) : {},
                        i = {};
                    return (i = t.extend(!0, s, i, n, a)), e.mask(i.template, i);
                }
            },
        };
    })(jQuery),
    (function (t) {
        t.HSCore.components.HSPWStrength = {
            defaults: { ui: { verdicts: ["Very Weak", "Weak", "Normal", "Medium", "Strong", "Very Strong"], container: !1, viewports: { progress: !1, verdict: !1 }, progressExtraCssClasses: !1 } },
            init: function (e, a) {
                if (e.length) {
                    var s = Object.assign({}, this.defaults),
                        n = e.attr("data-hs-pwstrength-options") ? JSON.parse(e.attr("data-hs-pwstrength-options")) : {},
                        i = {};
                    return (i = t.extend(!0, s, i, n, a)), e.pwstrength(i);
                }
            },
            methods: function (e) {
                var a = Array.prototype.slice.call(arguments, 1);
                t.fn.pwstrength.apply(e, a);
            },
        };
    })(jQuery),
    (function (t) {
        t.HSCore.components.HSFullcalendar = {
            defaults: { contentHeight: "auto", dayMaxEventRows: 2 },
            init: function (e, a) {
                if (e.length) {
                    var s = Object.assign({}, this.defaults),
                        n = e.attr("data-hs-fullcalendar-options") ? JSON.parse(e.attr("data-hs-fullcalendar-options")) : {},
                        i = {};
                    i = t.extend(!0, s, i, n, a);
                    var o = new FullCalendar.Calendar(e[0], i);
                    return o.render(), o;
                }
            },
        };
    })(jQuery),
    (function (t) {
        t.HSCore.components.HSTagify = {
            defaults: { clearBtnSelector: null, hasManualList: !1 },
            init: function (e, a) {
                if (e.length) {
                    var s = Object.assign({}, this.defaults),
                        n = e.attr("data-hs-tagify-options") ? JSON.parse(e.attr("data-hs-tagify-options")) : {},
                        i = {};
                    i = t.extend(!0, s, i, n, a);
                    var o = new Tagify(e[0], i);
                    return (
                        t(i.clearBtnSelector).on("click", o.removeAllTags.bind(o)),
                        i.hasManualList &&
                            (this._renderSuggestionsList(e, o),
                            e.on("add", function () {
                                1 === o.suggestedListItems.length && t(o.DOM.dropdown).empty().fadeOut(0);
                            }),
                            e.on("remove", function () {
                                0 === o.suggestedListItems.length && t(o.DOM.dropdown).fadeIn(0);
                            })),
                        o
                    );
                }
            },
            _renderSuggestionsList: function (t, e) {
                e.dropdown.show.call(e), t.parent()[0].appendChild(e.DOM.dropdown);
            },
        };
    })(jQuery),
    (function (t) {
        t.HSCore.components.HSFlatpickr = {
            defaults: {
                mode: "single",
                dateFormat: "d M Y",
                maxDate: !1,
                locale: { firstDayOfWeek: 1, weekdays: { shorthand: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] }, rangeSeparator: " - " },
                nextArrow: '<i class="tio-chevron-right flatpickr-custom-arrow"></i>',
                prevArrow: '<i class="tio-chevron-left flatpickr-custom-arrow"></i>',
                disableMobile: !0,
            },
            init: function (e, a) {
                if (e.length) {
                    var s = Object.assign({}, this.defaults),
                        n = e.attr("data-hs-flatpickr-options") ? JSON.parse(e.attr("data-hs-flatpickr-options")) : {},
                        i = {};
                    i = t.extend(!0, s, i, n, { appendTo: n ? t(n.appendTo)[0] : this }, a);
                    var o = e.flatpickr(i);
                    return e.css({ width: 7.5 * e.val().length }), o;
                }
            },
        };
    })(jQuery),
    (function (t) {
        t.HSCore.components.HSDropzone = {
            defaults: {
                url: "index.html",
                thumbnailWidth: 300,
                thumbnailHeight: 300,
                previewTemplate: t(
                    '<div>  <div class="col h-100 px-1 mb-2">    <div class="dz-preview dz-file-preview">      <div class="d-flex justify-content-end dz-close-icon">        <small class="tio-clear" data-dz-remove></small>      </div>      <div class="dz-details media">        <div class="dz-img">         <img class="img-fluid dz-img-inner" data-dz-thumbnail>        </div>        <div class="media-body dz-file-wrapper">         <h6 class="dz-filename">          <span class="dz-title" data-dz-name></span>         </h6>         <div class="dz-size" data-dz-size></div>        </div>      </div>      <div class="dz-progress progress">        <div class="dz-upload progress-bar bg-success" role="progressbar" style="width: 0" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" data-dz-uploadprogress></div>      </div>      <div class="d-flex align-items-center">        <div class="dz-success-mark">          <span class="tio-checkmark-circle"></span>        </div>        <div class="dz-error-mark">          <span class="tio-checkmark-circle-outlined"></span>        </div>        <div class="dz-error-message">          <small data-dz-errormessage></small>        </div>      </div>    </div>  </div></div>'
                ).html(),
            },
            init: function (e, a) {
                if (e.length) {
                    var s = t(e),
                        n = Object.assign({}, this.defaults),
                        i = s.attr("data-hs-dropzone-options") ? JSON.parse(s.attr("data-hs-dropzone-options")) : {},
                        o = {
                            init: function () {
                                var e = this,
                                    a = t(e.element).find(".dz-message");
                                e.on("addedfile", function (e) {
                                    "image/" !== String(e.type).slice(0, 6) &&
                                        t(e.previewElement)
                                            .find(".dz-img")
                                            .replaceWith('<span class="dz-file-initials">' + e.name.substring(0, 1).toUpperCase() + "</span>"),
                                        a.hide();
                                }),
                                    e.on("removedfile", function () {
                                        e.files.length <= 0 && a.show();
                                    });
                            },
                        };
                    return (o = t.extend(!0, n, o, i, a)), new Dropzone(e, o);
                }
            },
        };
    })(jQuery),
    (function (t) {
        t.HSCore.components.HSSortable = {
            defaults: {},
            init: function (e, a) {
                if (e.length) {
                    var s = Object.assign({}, this.defaults),
                        n = e.attr("data-hs-sortable-options") ? JSON.parse(e.attr("data-hs-sortable-options")) : {},
                        i = {};
                    return (i = t.extend(!0, s, i, n, a)), new Sortable(e[0], i);
                }
            },
        };
    })(jQuery),
    (function (t) {
        t.HSCore.components.HSValidation = {
            defaults: { errorElement: "div", errorClass: "invalid-feedback" },
            init: function (e, a) {
                if (e.length) {
                    var s = Object.assign({}, this.defaults),
                        n = e.attr("data-hs-validation-options") ? JSON.parse(e.attr("data-hs-validation-options")) : {},
                        i = {
                            errorPlacement: this.errorPlacement,
                            highlight: this.highlight,
                            unhighlight: this.unHighlight,
                            submitHandler: this.submitHandler,
                            onkeyup: function (e) {
                                t(e).valid();
                            },
                        };
                    (i = t.extend(!0, s, i, n, a)), e.hasClass("js-step-form") ? t.validator.setDefaults({ ignore: ":hidden:not(.active select)" }) : t.validator.setDefaults({ ignore: ":hidden:not(select)" });
                    var o = e.validate(i);
                    return (
                        e.find("select").length &&
                            e.find("select").change(function () {
                                t(this).valid();
                            }),
                        o
                    );
                }
            },
            rules: function (e) {
                var a = Array.prototype.slice.call(arguments, 1);
                t.fn.rules.apply(e, a);
            },
            errorPlacement: function (e, a) {
                var s = t(a).data("error-msg-classes");
                e.addClass(s), e.appendTo(a.parents(".js-form-message"));
            },
            highlight: function (e) {
                var a = t(e),
                    s = a.data("error-class") ? a.data("error-class") : "is-invalid",
                    n = a.data("success-class") ? a.data("error-class") : "is-valid",
                    i = a.parents(".js-form-message").first(),
                    o = a;
                void 0 !== i.data("validate-state") ? (o = i) : i.find("[data-validate-state]").length && (o = i.find("[data-validate-state]")), o.removeClass(n).addClass(s);
            },
            unHighlight: function (e) {
                var a = t(e),
                    s = a.data("error-class") ? a.data("error-class") : "is-invalid",
                    n = a.data("success-class") ? a.data("error-class") : "is-valid",
                    i = a.parents(".js-form-message").first(),
                    o = a;
                void 0 !== i.data("validate-state") ? (o = i) : i.find("[data-validate-state]").length && (o = i.find("[data-validate-state]")), o.removeClass(s).addClass(n);
            },
            submitHandler: function (t) {
                t.submit();
            },
        };
    })(jQuery),
    (function (t) {
        t.HSCore.components.HSChartJS = {
            defaults: {
                options: {
                    responsive: !0,
                    maintainAspectRatio: !1,
                    legend: { display: !1 },
                    tooltips: { enabled: !1, mode: "nearest", prefix: "", postfix: "", hasIndicator: !1, indicatorWidth: "8px", indicatorHeight: "8px", transition: "0.2s", lineWithLineColor: null, yearStamp: !0 },
                    gradientPosition: { x0: 0, y0: 0, x1: 0, y1: 0 },
                },
            },
            init: function (e, a) {
                if (e.length) {
                    var s = Object.assign({}, this.defaults),
                        n = e.attr("data-hs-chartjs-options") ? JSON.parse(e.attr("data-hs-chartjs-options")) : {},
                        i = {};
                    (i = t.extend(
                        !0,
                        n.type,
                        s,
                        "line" === n.type
                            ? {
                                  options: {
                                      scales: {
                                          yAxes: [
                                              {
                                                  ticks: {
                                                      callback: function (t, e, a) {
                                                          var s = i.options.scales.yAxes[0].ticks.metric,
                                                              n = i.options.scales.yAxes[0].ticks.prefix,
                                                              o = i.options.scales.yAxes[0].ticks.postfix;
                                                          return s && t > 100 && (t = t < 1e6 ? t / 1e3 + "k" : t / 1e6 + "kk"), n && o ? n + t + o : n ? n + t : o ? t + o : t;
                                                      },
                                                  },
                                              },
                                          ],
                                      },
                                      elements: { line: { borderWidth: 3 }, point: { pointStyle: "circle", radius: 5, hoverRadius: 7, borderWidth: 3, hoverBorderWidth: 3, backgroundColor: "#ffffff", hoverBackgroundColor: "#ffffff" } },
                                  },
                              }
                            : "bar" === n.type
                            ? {
                                  options: {
                                      scales: {
                                          yAxes: [
                                              {
                                                  ticks: {
                                                      callback: function (t, e, a) {
                                                          var s = i.options.scales.yAxes[0].ticks.metric,
                                                              n = i.options.scales.yAxes[0].ticks.prefix,
                                                              o = i.options.scales.yAxes[0].ticks.postfix;
                                                          return s && t > 100 && (t = t < 1e6 ? t / 1e3 + "k" : t / 1e6 + "kk"), n && o ? n + t + o : n ? n + t : o ? t + o : t;
                                                      },
                                                  },
                                              },
                                          ],
                                      },
                                  },
                              }
                            : {}
                    )),
                        "line" ===
                            (i = t.extend(
                                !0,
                                i,
                                {
                                    options: {
                                        tooltips: {
                                            custom: function (t) {
                                                var a = document.getElementById("chartjsTooltip");
                                                if (
                                                    (a ||
                                                        (((a = document.createElement("div")).id = "chartjsTooltip"),
                                                        (a.style.opacity = 0),
                                                        a.classList.add("hs-chartjs-tooltip-wrap"),
                                                        (a.innerHTML = '<div class="hs-chartjs-tooltip"></div>'),
                                                        i.options.tooltips.lineMode ? e.parent(".chartjs-custom").append(a) : document.body.appendChild(a)),
                                                    0 === t.opacity)
                                                )
                                                    return (a.style.opacity = 0), void a.parentNode.removeChild(a);
                                                if ((a.classList.remove("above", "below", "no-transform"), t.yAlign ? a.classList.add(t.yAlign) : a.classList.add("no-transform"), t.body)) {
                                                    var s = t.title || [],
                                                        n = t.body.map(function (t) {
                                                            return t.lines;
                                                        }),
                                                        o = new Date(),
                                                        r = '<header class="hs-chartjs-tooltip-header">';
                                                    s.forEach(function (t) {
                                                        r += i.options.tooltips.yearStamp ? t + ", " + o.getFullYear() : t;
                                                    }),
                                                        (r += '</header><div class="hs-chartjs-tooltip-body">'),
                                                        n.forEach(function (e, a) {
                                                            r += "<div>";
                                                            var s = e[0],
                                                                n = s,
                                                                o = t.labelColors[a].backgroundColor instanceof Object ? t.labelColors[a].borderColor : t.labelColors[a].backgroundColor;
                                                            (r +=
                                                                (i.options.tooltips.hasIndicator
                                                                    ? '<span class="d-inline-block rounded-circle mr-1" style="width: ' +
                                                                      i.options.tooltips.indicatorWidth +
                                                                      "; height: " +
                                                                      i.options.tooltips.indicatorHeight +
                                                                      "; background-color: " +
                                                                      o +
                                                                      '"></span>'
                                                                    : "") +
                                                                i.options.tooltips.prefix +
                                                                (s.length > 3 ? n : e) +
                                                                i.options.tooltips.postfix),
                                                                (r += "</div>");
                                                        }),
                                                        (r += "</div>"),
                                                        (a.querySelector(".hs-chartjs-tooltip").innerHTML = r);
                                                }
                                                var l = this._chart.canvas.getBoundingClientRect();
                                                (a.style.opacity = 1),
                                                    i.options.tooltips.lineMode ? (a.style.left = t.caretX + "px") : (a.style.left = l.left + window.pageXOffset + t.caretX - a.offsetWidth / 2 - 3 + "px"),
                                                    (a.style.top = l.top + window.pageYOffset + t.caretY - a.offsetHeight - 25 + "px"),
                                                    (a.style.pointerEvents = "none"),
                                                    (a.style.transition = i.options.tooltips.transition);
                                            },
                                        },
                                    },
                                },
                                n,
                                i,
                                a
                            )).type &&
                            i.data.datasets.forEach(function (t) {
                                if (Array.isArray(t.backgroundColor)) {
                                    var a = e[0].getContext("2d").createLinearGradient(i.options.gradientPosition.x0, i.options.gradientPosition.y0, i.options.gradientPosition.x1, i.options.gradientPosition.y1);
                                    for (let e = 0; e < t.backgroundColor.length; e++) a.addColorStop(e, t.backgroundColor[e]);
                                    t.backgroundColor = a;
                                }
                            });
                    var o = new Chart(e, i);
                    if ("line" === i.type && i.options.tooltips.lineMode) {
                        var r = o.draw;
                        (o.draw = function (e) {
                            if ((r.call(this, e), this.chart.tooltip._active && this.chart.tooltip._active.length)) {
                                this.chart.tooltip._active[0];
                                var a = t(this.chart.canvas),
                                    s = t(".hs-chartjs-tooltip-wrap"),
                                    n = t("#chartjsTooltipLine"),
                                    o = i.options.tooltips.lineWithLineTopOffset >= 0 ? i.options.tooltips.lineWithLineTopOffset : 7,
                                    l = i.options.tooltips.lineWithLineBottomOffset >= 0 ? i.options.tooltips.lineWithLineBottomOffset : 43;
                                t("#chartjsTooltip #chartjsTooltipLine").length || t("#chartjsTooltip").append('<div id="chartjsTooltipLine"></div>'),
                                    s.css({ top: a.height() / 2 - s.height() }),
                                    n.css({ top: -(s.offset().top - a.offset().top) + o }),
                                    s.offset().left + s.width() > a.offset().left + a.width() - 100
                                        ? t(".hs-chartjs-tooltip").removeClass("hs-chartjs-tooltip-right").addClass("hs-chartjs-tooltip-left")
                                        : t(".hs-chartjs-tooltip").addClass("hs-chartjs-tooltip-right").removeClass("hs-chartjs-tooltip-left"),
                                    n.length &&
                                        n.css({ position: "absolute", width: "2px", height: a.height() - l, backgroundColor: i.options.tooltips.lineWithLineColor, left: 0, transform: "translateX(-50%)", zIndex: 0, transition: "100ms" });
                            }
                        }),
                            e.on("mouseleave", function () {
                                t("#lineTooltipChartJSStyles").attr("media", "max-width: 1px");
                            }),
                            e.on("mouseenter", function () {
                                t("#lineTooltipChartJSStyles").removeAttr("media");
                            }),
                            e.on("mousemove", function (a) {
                                a.pageY - e.offset().top > t(".hs-chartjs-tooltip-wrap").height() / 2 &&
                                    a.pageY - e.offset().top + t(".hs-chartjs-tooltip-wrap").outerHeight() / 2 < e.height() &&
                                    t(".hs-chartjs-tooltip").css({ top: a.pageY + t(".hs-chartjs-tooltip-wrap").height() / 2 - (e.offset().top + e.height() / 2) });
                            });
                    }
                    return o;
                }
            },
        };
    })(jQuery),
    (function (t) {
        t.HSCore.components.HSJVectorMap = {
            defaults: { map: "world_mill_en", zoomOnScroll: !1 },
            init: function (e, a) {
                if (e.length) {
                    var s = Object.assign({}, this.defaults),
                        n = e.attr("data-hs-jvector-map-options") ? JSON.parse(e.attr("data-hs-jvector-map-options")) : {},
                        i = {};
                    (i = t.extend(!0, s, n, i, a)).container = e;
                    var o = new jvm.Map(i);
                    return i.tipCentered ? this.tipCentered(o.tip) : this.fixTipPosition(o.tip), o;
                }
            },
            tipCentered: function (e) {
                t(".jvectormap-container").mousemove(function (t) {
                    var a = e.offset().top - 7,
                        s = t.clientX - e.width() / 2;
                    e.addClass("jvectormap-tip-cntered"), e.css({ top: a, left: s });
                });
            },
            fixTipPosition: function (e) {
                t(".jvectormap-container").mousemove(function (t) {
                    var a = e.offset().left;
                    e.css({ left: a });
                });
            },
        };
    })(jQuery),
    (function (t) {
        t.HSCore.components.HSQuill = {
            __proto__: t.fn.quill,
            defaults: { theme: "snow", attach: !1 },
            init: function (e, a) {
                if (t(e).length) {
                    var s = t(e),
                        n = Object.assign({}, this.defaults),
                        i = s.attr("data-hs-quill-options") ? JSON.parse(s.attr("data-hs-quill-options")) : {},
                        o = {};
                    o = Object.assign({}, n, o, i, a);
                    var r = new Quill(e, o);
                    return this.toolbarBottom(r, o), r;
                }
            },
            toolbarBottom: function (e, a) {
                if (a.toolbarBottom) {
                    let s = t(e.container),
                        n = t(e.container).prev(".ql-toolbar");
                    s.parent().addClass("ql-toolbar-bottom"),
                        a.attach
                            ? t(a.attach).on("shown.bs.modal", function (t) {
                                  s.css({ paddingBottom: n.innerHeight() });
                              })
                            : s.css({ paddingBottom: n.innerHeight() }),
                        n.css({ position: "absolute", width: "100%", bottom: 0 });
                }
            },
        };
    })(jQuery),
    (function (t) {
        t.HSCore.components.HSLeaflet = {
            defaults: {
                map: { coords: [51.505, -0.09], zoom: 13 },
                layer: { token: "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw", id: "mapbox/streets-v11", maxZoom: 18 },
                marker: null,
            },
            init: function (e, a) {
                if (t(e).length) {
                    var s = t(e),
                        n = s.attr("data-hs-leaflet-options") ? JSON.parse(s.attr("data-hs-leaflet-options")) : {},
                        i = {};
                    i = t.extend(!0, this.defaults, n, i, a);
                    var o = L.map(e, i.map);
                    if ((o.setView(i.map.coords, i.map.zoom), L.tileLayer(i.layer.token, i.layer).addTo(o), i.marker))
                        for (var r = 0; r < i.marker.length; r++) {
                            i.marker[r].icon = L.icon(i.marker[r].icon);
                            let t = L.marker(i.marker[r].coords, i.marker[r]).addTo(o);
                            i.marker[r].popup && t.bindPopup(i.marker[r].popup.text);
                        }
                    return o;
                }
            },
        };
    })(jQuery),
    (function (t) {
        t.HSCore.components.HSFancyBox = {
            defaults: {
                parentEl: "body",
                baseClass: "fancybox-custom",
                slideClass: "fancybox-slide",
                speed: 2e3,
                animationEffect: "fade",
                slideSpeedCoefficient: 1,
                infobar: !1,
                slideShow: { autoStart: !1, speed: 2e3 },
                transitionEffect: "slide",
                baseTpl:
                    '<div class="fancybox-container" role="dialog" tabindex="-1"><div class="fancybox-bg"></div>  <div class="fancybox-inner">    <div class="fancybox-infobar">      <span data-fancybox-index></span>&nbsp;/&nbsp;<span data-fancybox-count></span>    </div>    <div class="fancybox-toolbar">{{buttons}}</div>    <div class="fancybox-navigation">{{arrows}}</div>    <div class="fancybox-slider-wrap">      <div class="fancybox-stage"></div>    </div>    <div class="fancybox-caption-wrap">      <div class="fancybox-caption">        <div class="fancybox-caption__body"></div>      </div>    </div>  </div></div>',
            },
            init: function (e, a) {
                if (e.length) {
                    var s = t(e),
                        n = Object.assign({}, this.defaults),
                        i = s.attr("data-hs-fancybox-options") ? JSON.parse(s.attr("data-hs-fancybox-options")) : {},
                        o = {
                            beforeShow: function (e) {
                                var a = t(e.$refs.bg[0]),
                                    s = t(e.current.$slide),
                                    n = e.current.opts.$orig[0].dataset.hsFancyboxOptions ? JSON.parse(e.current.opts.$orig[0].dataset.hsFancyboxOptions) : {},
                                    i = !!n.transitionEffectCustom && n.transitionEffectCustom,
                                    o = n.overlayBg,
                                    r = n.overlayBlurBg;
                                i && s.css("visibility", "hidden"), o && a.css({ backgroundColor: o }), r && t("body").addClass("fancybox-blur");
                            },
                            afterShow: function (e) {
                                var a = t(e.current.$slide),
                                    s = void 0 !== e.group[e.prevPos] && t(e.group[e.prevPos].$slide) ? t(e.group[e.prevPos].$slide) : null,
                                    n = e.current.opts.$orig[0].dataset.hsFancyboxOptions ? JSON.parse(e.current.opts.$orig[0].dataset.hsFancyboxOptions) : {},
                                    i = !!n.transitionEffectCustom && n.transitionEffectCustom;
                                i &&
                                    (a.css("visibility", "visible"),
                                    a.hasClass("animated") || a.addClass("animated"),
                                    s && !s.hasClass("animated") && s.addClass("animated"),
                                    t("body").hasClass("fancybox-opened")
                                        ? (a.addClass(i.onShow),
                                          a.on("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", function (t) {
                                              a.removeClass(i.onShow);
                                          }),
                                          s &&
                                              (s.addClass(i.onHide),
                                              s.on("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", function (t) {
                                                  s.removeClass(i.onHide);
                                              })))
                                        : (a.addClass(i.onShow),
                                          a.on("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", function (e) {
                                              a.removeClass(i.onShow), t("body").addClass("fancybox-opened");
                                          })));
                            },
                            beforeClose: function (e) {
                                var a = t(e.current.$slide),
                                    s = e.current.opts.$orig[0].dataset.hsFancyboxOptions ? JSON.parse(e.current.opts.$orig[0].dataset.hsFancyboxOptions) : {},
                                    n = !!s.transitionEffectCustom && s.transitionEffectCustom;
                                s.overlayBlurBg;
                                n && (a.removeClass(n.onShow).addClass(n.onHide), t("body").removeClass("fancybox-opened")), t("body").removeClass("fancybox-blur");
                            },
                        };
                    return (o = t.extend(!0, n, o, i, a)), t(e).fancybox(o);
                }
            },
        };
    })(jQuery),
    (function (t) {
        t.HSCore.components.HSCircles = {
            defaults: {
                radius: 80,
                duration: 1e3,
                wrpClass: "circles-wrap",
                colors: ["#377dff", "#e7eaf3"],
                debounce: 10,
                rtl: !1,
                isHideValue: !1,
                dividerSpace: null,
                isViewportInit: !1,
                fgStrokeLinecap: null,
                fgStrokeMiterlimit: null,
                additionalTextType: null,
                additionalText: null,
                textFontSize: null,
                textFontWeight: null,
                textColor: null,
                secondaryText: null,
                secondaryTextFontWeight: null,
                secondaryTextFontSize: null,
                secondaryTextColor: null,
            },
            init: function (e, a) {
                if (e.length) {
                    var s = Object.assign({}, this.defaults),
                        n = e.attr("data-hs-circles-options") ? JSON.parse(e.attr("data-hs-circles-options")) : {},
                        i = {
                            id: "circle-" + Math.random().toString().slice(2),
                            value: 0,
                            text: function (t) {
                                return "iconic" === n.type
                                    ? n.icon
                                    : "prefix" === n.additionalTextType
                                    ? n.secondaryText
                                        ? (n.additionalText || "") +
                                          (n.isHideValue ? "" : t) +
                                          '<div style="margin-top: ' +
                                          (n.dividerSpace / 2 + "px" || "0") +
                                          "; margin-bottom: " +
                                          (n.dividerSpace / 2 + "px" || "0") +
                                          ';"></div><div style="font-weight: ' +
                                          n.secondaryTextFontWeight +
                                          "; font-size: " +
                                          n.secondaryTextFontSize +
                                          "px; color: " +
                                          n.secondaryTextColor +
                                          ';">' +
                                          n.secondaryText +
                                          "</div>"
                                        : (n.additionalText || "") + (n.isHideValue ? "" : t)
                                    : n.secondaryText
                                    ? (n.isHideValue ? "" : t) +
                                      (n.additionalText || "") +
                                      '<div style="margin-top: ' +
                                      (n.dividerSpace / 2 + "px" || "0") +
                                      "; margin-bottom: " +
                                      (n.dividerSpace / 2 + "px" || "0") +
                                      ';"></div><div style="font-weight: ' +
                                      n.secondaryTextFontWeight +
                                      "; font-size: " +
                                      n.secondaryTextFontSize +
                                      "px; color: " +
                                      n.secondaryTextColor +
                                      ';">' +
                                      n.secondaryText +
                                      "</div>"
                                    : (n.isHideValue ? "" : t) + (n.additionalText || "");
                            },
                        };
                    (i = t.extend(s, i, n, a)).isViewportInit && (i.value = 0), this.setId(e, i.id);
                    var o = Circles.create(i);
                    return (
                        e.data("circle", o),
                        this.setTextStyles(e, o, i),
                        i.rtl && this.setRtl(e),
                        i.fgStrokeLinecap && this.setStrokeLineCap(e, o, i),
                        i.fgStrokeMiterlimit && this.setStrokeMiterLimit(e, o, i),
                        i.isViewportInit && this.initAppear(o, i),
                        o
                    );
                }
            },
            setId: function (t, e) {
                t.attr("id", e);
            },
            setTextStyles: function (t, e, a) {
                var s = a;
                t.find('[class="' + (s.textClass || e._textClass) + '"]').css({ "font-size": s.textFontSize, "font-weight": s.textFontWeight, color: s.textColor, "line-height": "normal", height: "auto", top: "", left: "" });
            },
            setRtl: function (t) {
                t.find("svg").css("transform", "matrix(-1, 0, 0, 1, 0, 0)");
            },
            setStrokeLineCap: function (t, e, a) {
                var s = a;
                t.find('[class="' + e._valClass + '"]').attr("stroke-linecap", s.fgStrokeLinecap);
            },
            setStrokeMiterLimit: function (t, e, a) {
                var s = a;
                t.find('[class="' + e._valClass + '"]').attr("stroke-miterlimit", s.fgStrokeMiterlimit);
            },
            initAppear: function (e, a) {
                var s = a;
                appear({
                    bounds: s.bounds,
                    debounce: s.debounce,
                    elements: function () {
                        return document.querySelectorAll("#" + s.id);
                    },
                    appear: function (a) {
                        e.update(JSON.parse(t(a).attr("data-hs-circles-options")).value);
                    },
                });
            },
        };
    })(jQuery),
    (function (t) {
        t.HSCore.components.HSList = {
            defaults: { searchMenu: !1, searchMenuDelay: 300, searchMenuOutsideClose: !0, searchMenuInsideClose: !0, clearSearchInput: !0, keyboard: !1, empty: !1 },
            init: function (e, a) {
                if (t(e).length) {
                    var s = this,
                        n = t(e),
                        i = Object.assign({}, s.defaults),
                        o = n.attr("data-hs-list-options") ? JSON.parse(n.attr("data-hs-list-options")) : {},
                        r = {};
                    r = t.extend(!0, i, r, o, a);
                    var l = new List(n.attr("id"), r, r.values);
                    return (
                        r.searchMenu && t(l.list).fadeOut(0),
                        l.on("searchComplete", function () {
                            r.searchMenu && (s.searchMenu(n, r, l), s.searchMenuHide(n, r, l)), !r.searchMenu && r.empty && s.emptyBlock(n, r, l);
                        }),
                        r.searchMenu && r.keyboard && s.initializeHover(n, r, l),
                        l
                    );
                }
            },
            initializeHover: function (e, a, s) {
                var n,
                    i = s,
                    o = (t(i.list).find(".list-group-item"), e.find("." + i.searchClass));
                t(o).keydown(function (e) {
                    if (40 === e.which) {
                        if ((e.preventDefault(), 0 == t(i.list).children(".active").length)) n = t(i.list).children().first().addClass("active");
                        else if (t(i.list).children(".active").next().length) {
                            var a = t(i.list).children(".active").next().addClass("active");
                            t(n).removeClass("active"), (n = a), t(i.list).height() < t(i.list).children(".active").position().top && t(i.list).scrollTop(t(i.list).children(".active").position().top + t(i.list).scrollTop());
                        }
                    } else if (38 === e.which) {
                        if ((e.preventDefault(), 0 == t(i.list).children(".active").length)) n = t(i.list).children().first().parent().addClass("active");
                        else if (t(i.list).children(".active").prev().length) {
                            a = t(i.list).children(".active").prev().addClass("active");
                            t(n).removeClass("active"), (n = a), 0 > t(i.list).children(".active").position().top && t(i.list).scrollTop(t(i.list).children(".active").position().top + t(i.list).scrollTop());
                        }
                    } else 13 == e.which && o.val().length > 0 && (e.preventDefault(), window.location.replace(t(n).find("a").first().attr("href")));
                });
            },
            searchMenu: function (e, a, s) {
                var n = a,
                    i = s;
                if (0 === e.find("." + i.searchClass).val().length || (0 === i.visibleItems.length && !n.empty)) t(n.empty).fadeOut(0), t(i.list).fadeOut(n.searchMenuDelay);
                else if ((t(i.list).fadeIn(n.searchMenuDelay), !i.visibleItems.length)) {
                    var o = t(n.empty).clone();
                    t(i.list).html(o), t(o).fadeIn(0);
                }
            },
            searchMenuHide: function (e, a, s) {
                var n = a,
                    i = s,
                    o = e.find("." + i.searchClass);
                n.searchMenuOutsideClose &&
                    t(window).click(function () {
                        t(i.list).fadeOut(n.searchMenuDelay), n.clearSearchInput && o.val("");
                    }),
                    n.searchMenuInsideClose ||
                        t(i.list).click(function (t) {
                            t.stopPropagation(), n.clearSearchInput && o.val("");
                        });
            },
            emptyBlock: function (e, a, s) {
                var n = a,
                    i = s;
                if (0 === e.find("." + i.searchClass).val().length || (0 === i.visibleItems.length && !n.empty)) t(n.empty).fadeOut(0);
                else if ((t(i.list).fadeIn(n.searchMenuDelay), !i.visibleItems.length)) {
                    var o = t(n.empty).clone();
                    t(i.list).html(o), t(o).fadeIn(0);
                }
            },
        };
    })(jQuery),
    (function (t) {
        t.HSCore.components.HSDaterangepicker = {
            defaults: { nextArrow: '<i class="tio-chevron-right daterangepicker-custom-arrow"></i>', prevArrow: '<i class="tio-chevron-left daterangepicker-custom-arrow"></i>' },
            init: function (e, a, s) {
                if (e.length) {
                    var n = Object.assign({}, this.defaults),
                        i = e.attr("data-hs-daterangepicker-options") ? JSON.parse(e.attr("data-hs-daterangepicker-options")) : {},
                        o = {};
                    (o = t.extend(!0, n, i, o, a, s)).disablePrevDates && (o.minDate = moment().format("MM/DD/YYYY"));
                    var r = e.daterangepicker(o, s);
                    return (
                        r.on("showCalendar.daterangepicker", function (e) {
                            (o.prevArrow || o.nextArrow) && (t(".daterangepicker .prev").html(o.prevArrow), t(".daterangepicker .next").html(o.nextArrow));
                        }),
                        r
                    );
                }
            },
        };
    })(jQuery),
    (function (t) {
        t.HSCore.components.HSIonRangeSlider = {
            defaults: {
                type: "single",
                hide_min_max: !0,
                hide_from_to: !0,
                foreground_target_el: null,
                secondary_target_el: null,
                secondary_val: { steps: null, values: null },
                result_min_target_el: null,
                result_max_target_el: null,
                cusOnChange: null,
            },
            init: function (e, a) {
                if (e.length && void 0 !== e.attr("data-hs-ion-range-slider-options")) {
                    var s = Object.assign({}, this.defaults),
                        n = e.attr("data-hs-ion-range-slider-options") ? JSON.parse(e.attr("data-hs-ion-range-slider-options")) : {},
                        i = {
                            onStart: function (e) {
                                if (i.foreground_target_el) {
                                    var a = 100 - (e.from_percent + (100 - e.to_percent));
                                    t(i.foreground_target_el).css({ left: e.from_percent + "%", width: a + "%" }),
                                        t(i.foreground_target_el + " > *").css({ width: t(i.foreground_target_el).parent().width(), transform: "translateX(-" + e.from_percent + "%)" });
                                }
                                if (
                                    (i.result_min_target_el && "single" === i.type
                                        ? t(i.result_min_target_el).is("input")
                                            ? t(i.result_min_target_el).val(e.from)
                                            : t(i.result_min_target_el).text(e.from)
                                        : (i.result_min_target_el || (i.result_max_target_el && "double" === i.type)) &&
                                          (t(i.result_min_target_el).is("input") ? t(i.result_min_target_el).val(e.from) : t(i.result_min_target_el).text(e.from),
                                          t(i.result_min_target_el).is("input") ? t(i.result_max_target_el).val(e.to) : t(i.result_max_target_el).text(e.to)),
                                    i.grid &&
                                        "single" === i.type &&
                                        t(e.slider)
                                            .find(".irs-grid-text")
                                            .each(function (a) {
                                                var s = t(this);
                                                t(s).text() === e.from && (t(e.slider).find(".irs-grid-text").removeClass("current"), t(s).addClass("current"));
                                            }),
                                    i.secondary_target_el)
                                ) {
                                    i.secondary_val.steps.push(e.max + 1), i.secondary_val.values.push(i.secondary_val.values[i.secondary_val.values.length - 1] + 1);
                                    for (var s = 0; s < i.secondary_val.steps.length; s++)
                                        e.from >= i.secondary_val.steps[s] &&
                                            e.from < i.secondary_val.steps[s + 1] &&
                                            (t(i.secondary_target_el).is("input") ? t(i.secondary_target_el).val(i.secondary_val.values[s]) : t(i.secondary_target_el).text(i.secondary_val.values[s]));
                                }
                            },
                            onChange: function (e) {
                                if (i.foreground_target_el) {
                                    var s = 100 - (e.from_percent + (100 - e.to_percent));
                                    t(i.foreground_target_el).css({ left: e.from_percent + "%", width: s + "%" }),
                                        t(i.foreground_target_el + "> *").css({ width: t(i.foreground_target_el).parent().width(), transform: "translateX(-" + e.from_percent + "%)" });
                                }
                                if (
                                    (i.result_min_target_el && "single" === i.type
                                        ? t(i.result_min_target_el).is("input")
                                            ? t(i.result_min_target_el).val(e.from)
                                            : t(i.result_min_target_el).text(e.from)
                                        : (i.result_min_target_el || (i.result_max_target_el && "double" === i.type)) &&
                                          (t(i.result_min_target_el).is("input") ? t(i.result_min_target_el).val(e.from) : t(i.result_min_target_el).text(e.from),
                                          t(i.result_min_target_el).is("input") ? t(i.result_max_target_el).val(e.to) : t(i.result_max_target_el).text(e.to)),
                                    i.grid &&
                                        "single" === i.type &&
                                        t(e.slider)
                                            .find(".irs-grid-text")
                                            .each(function (a) {
                                                var s = t(this);
                                                t(s).text() === e.from && (t(e.slider).find(".irs-grid-text").removeClass("current"), t(s).addClass("current"));
                                            }),
                                    i.secondary_target_el)
                                )
                                    for (var n = 0; n < i.secondary_val.steps.length; n++)
                                        e.from >= i.secondary_val.steps[n] &&
                                            e.from < i.secondary_val.steps[n + 1] &&
                                            (t(i.secondary_target_el).is("input") ? t(i.secondary_target_el).val(i.secondary_val.values[n]) : t(i.secondary_target_el).text(i.secondary_val.values[n]));
                                a && a.cusOnChange && "function" == typeof a.cusOnChange && a.cusOnChange();
                            },
                        };
                    i = t.extend(!0, s, i, n, a);
                    var o = e.ionRangeSlider(i),
                        r = e.data("ionRangeSlider");
                    return (
                        i.result_min_target_el && "single" === i.type && t(i.result_min_target_el).is("input")
                            ? t(i.result_min_target_el).on("change", function () {
                                  r.update({ from: t(this).val() });
                              })
                            : (i.result_min_target_el || (i.result_max_target_el && "double" === i.type && t(i.result_min_target_el).is("input")) || t(i.result_max_target_el).is("input")) &&
                              (t(i.result_min_target_el).on("change", function () {
                                  r.update({ from: t(this).val() });
                              }),
                              t(i.result_max_target_el).on("change", function () {
                                  r.update({ to: t(this).val() });
                              })),
                        t(window).on("resize", function () {
                            t(i.foreground_target_el + " > *").css({ width: t(i.foreground_target_el).parent().width() });
                        }),
                        o
                    );
                }
            },
        };
    })(jQuery);


const body = document.getElementsByTagName('body')[0],
isMini =  window.localStorage.getItem('hs-navbar-vertical-aside-mini') === null ? false : window.localStorage.getItem('hs-navbar-vertical-aside-mini');

if (isMini) {
  body.classList.add('navbar-vertical-aside-mini-mode')
}

$(document).on("ready", function () {
    // INITIALIZATION OF NAVBAR VERTICAL NAVIGATION
    var sidebar = $('.js-navbar-vertical-aside');
    sidebar.hsSideNav({
      mobileOverlayClass: 'd-print-none'
    });
    // INITIALIZATION OF UNFOLD
    $(".js-hs-unfold-invoker").each(function () {
        var unfold = new HSUnfold($(this)).init();
    });
});